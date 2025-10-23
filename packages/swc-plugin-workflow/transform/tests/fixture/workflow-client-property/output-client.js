// Test workflow functions in client mode
/**__internal_workflows{"workflows":{"input.js":{"arrowWorkflow":{"workflowId":"workflow//input.js//arrowWorkflow"},"defaultWorkflow":{"workflowId":"workflow//input.js//defaultWorkflow"},"internalWorkflow":{"workflowId":"workflow//input.js//internalWorkflow"},"myWorkflow":{"workflowId":"workflow//input.js//myWorkflow"}}}}*/;
export async function myWorkflow() {
    throw new Error("You attempted to execute workflow myWorkflow function directly. To start a workflow, use start(myWorkflow) from workflow");
}
myWorkflow.workflowId = "workflow//input.js//myWorkflow";
export const arrowWorkflow = async ()=>{
    throw new Error("You attempted to execute workflow arrowWorkflow function directly. To start a workflow, use start(arrowWorkflow) from workflow");
};
arrowWorkflow.workflowId = "workflow//input.js//arrowWorkflow";
export default async function defaultWorkflow() {
    throw new Error("You attempted to execute workflow defaultWorkflow function directly. To start a workflow, use start(defaultWorkflow) from workflow");
}
defaultWorkflow.workflowId = "workflow//input.js//defaultWorkflow";
// Non-export workflow function
async function internalWorkflow() {
    throw new Error("You attempted to execute workflow internalWorkflow function directly. To start a workflow, use start(internalWorkflow) from workflow");
}
internalWorkflow.workflowId = "workflow//input.js//internalWorkflow";
// Use the internal workflow to avoid lint warning
regularFunction(internalWorkflow);
// Regular function should not be affected
export function regularFunction() {
    return 'regular';
}
