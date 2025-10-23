import { expect, test, vi } from 'vitest';
import { hydrateWorkflowReturnValue } from 'workflow/internal/serialization';
import { createFetcher, startServer } from './util.mjs';

export function idempotency(world: string) {
  test('idempotency', { timeout: 60_000 }, async () => {
    const server = await startServer({ world }).then(createFetcher);
    const result = await server.invoke('workflows/noop.ts', 'brokenWf', [1, 2]);
    expect(result.runId).toMatch(/^wrun_.+/);
    const run = await vi.waitFor(
      async () => {
        const run = await server.getRun(result.runId);
        expect(run).toMatchObject<Partial<typeof run>>({
          status: 'completed',
        });
        return run;
      },
      {
        interval: 200,
        timeout: 59_000,
      }
    );

    const output = await hydrateWorkflowReturnValue(run.output, [], globalThis);

    expect(output).toEqual({
      numbers: Array.from({ length: 110 }, () => expect.any(Number)),
    });
  });
}
