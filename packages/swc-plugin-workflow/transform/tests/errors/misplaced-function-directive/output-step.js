import { registerStepFunction } from "workflow/internal/private";
/**__internal_workflows{"steps":{"input.js":{"badStep":{"stepId":"step//input.js//badStep"}}}}*/;
export async function badStep() {
    const x = 42;
    // Error: directive must be at the top of function
    'use step';
    return x;
}
export const badWorkflow = async ()=>{
    console.log('hello');
    // Error: directive must be at the top of function
    'use workflow';
    return true;
};
registerStepFunction("step//input.js//badStep", badStep);
