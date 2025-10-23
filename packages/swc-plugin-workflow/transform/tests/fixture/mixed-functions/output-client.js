import { runStep as __private_run_step } from "workflow/api";
/**__internal_workflows{"workflows":{"input.js":{"workflowFunction":{"workflowId":"workflow//input.js//workflowFunction"}}},"steps":{"input.js":{"stepFunction":{"stepId":"step//input.js//stepFunction"}}}}*/;
export async function stepFunction(a, b) {
    return __private_run_step("stepFunction", {
        arguments: [
            a,
            b
        ]
    });
}
export async function workflowFunction(a, b) {
    throw new Error("You attempted to execute workflow workflowFunction function directly. To start a workflow, use start(workflowFunction) from workflow");
}
workflowFunction.workflowId = "workflow//input.js//workflowFunction";
export async function normalFunction(a, b) {
    return a * b;
}
