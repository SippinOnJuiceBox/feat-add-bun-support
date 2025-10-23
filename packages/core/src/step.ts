import { FatalError, WorkflowRuntimeError } from '@workflow/errors';
import { EventConsumerResult } from './events-consumer.js';
import { WorkflowSuspension } from './global.js';
import { stepLogger } from './logger.js';
import type { WorkflowOrchestratorContext } from './private.js';
import type { Serializable } from './schemas.js';
import { hydrateStepReturnValue } from './serialization.js';
import { withResolvers } from './util.js';

export function createUseStep(ctx: WorkflowOrchestratorContext) {
  return function useStep<Args extends Serializable[], Result>(
    stepName: string
  ) {
    return (...args: Args): Promise<Result> => {
      const { promise, resolve, reject } = withResolvers<Result>();

      const correlationId = `step_${ctx.generateUlid()}`;
      ctx.invocationsQueue.push({
        type: 'step',
        correlationId,
        stepName,
        args,
      });

      // Track whether we've already seen a "step_started" event for this step.
      // This is important because after a retryable failure, the step moves back to
      // "pending" status which causes another "step_started" event to be emitted.
      let hasSeenStepStarted = false;

      stepLogger.debug('Step consumer setup', {
        correlationId,
        stepName,
        args,
      });
      ctx.eventsConsumer.subscribe((event) => {
        if (!event) {
          // We've reached the end of the events, so this step has either not been run or is currently running.
          // Crucially, if we got here, then this step Promise does
          // not resolve so that the user workflow code does not proceed any further.
          // Notify the workflow handler that this step has not been run / has not completed yet.
          setTimeout(() => {
            ctx.onWorkflowError(
              new WorkflowSuspension(ctx.invocationsQueue, ctx.globalThis)
            );
          }, 0);
          return EventConsumerResult.NotConsumed;
        }

        stepLogger.debug('Step consumer event processing', {
          correlationId,
          stepName,
          args: args.join(', '),
          incomingCorrelationId: event.correlationId,
          isMatch: correlationId === event.correlationId,
          eventType: event.eventType,
        });

        if (event.correlationId !== correlationId) {
          // We're not interested in this event - the correlationId belongs to a different step
          return EventConsumerResult.NotConsumed;
        }

        if (event.eventType === 'step_started') {
          // Step has started - so remove from the invocations queue (only on the first "step_started" event)
          if (!hasSeenStepStarted) {
            const invocationsQueueIndex = ctx.invocationsQueue.findIndex(
              (invocation) =>
                invocation.type === 'step' &&
                invocation.correlationId === correlationId
            );
            if (invocationsQueueIndex !== -1) {
              ctx.invocationsQueue.splice(invocationsQueueIndex, 1);
            } else {
              setTimeout(() => {
                reject(
                  new WorkflowRuntimeError(
                    `Corrupted event log: step ${correlationId} (${stepName}) started but not found in invocation queue`
                  )
                );
              }, 0);
              return EventConsumerResult.Finished;
            }
            hasSeenStepStarted = true;
          }
          // If this is a subsequent "step_started" event (after a retry), we just consume it
          // without trying to remove from the queue again or logging a warning
          return EventConsumerResult.Consumed;
        }

        if (event.eventType === 'step_failed') {
          // Step failed - bubble up to workflow
          if (event.eventData.fatal) {
            setTimeout(() => {
              reject(new FatalError(event.eventData.error));
            }, 0);
            return EventConsumerResult.Finished;
          } else {
            // This is a retryable error, so nothing to do here,
            // but we will consume the event
            return EventConsumerResult.Consumed;
          }
        } else if (event.eventType === 'step_completed') {
          // Step has already completed, so resolve the Promise with the cached result
          const hydratedResult = hydrateStepReturnValue(
            event.eventData.result,
            ctx.globalThis
          );
          setTimeout(() => {
            resolve(hydratedResult);
          }, 0);
          return EventConsumerResult.Finished;
        } else {
          // An unexpected event type has been received, but it does belong to this step (matching `correlationId`)
          setTimeout(() => {
            reject(
              new WorkflowRuntimeError(
                `Unexpected event type: "${event.eventType}"`
              )
            );
          }, 0);
          return EventConsumerResult.Finished;
        }
      });

      return promise;
    };
  };
}
