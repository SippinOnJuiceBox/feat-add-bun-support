/**__internal_workflows{"steps":{"input.js":{"badStep":{"stepId":"step//input.js//badStep"}}}}*/;
export async function badStep() {
    return globalThis[Symbol.for("WORKFLOW_USE_STEP")]("step//input.js//badStep")();
}
export const badWorkflow = async ()=>{
    console.log('hello');
    // Error: directive must be at the top of function
    'use workflow';
    return true;
};
