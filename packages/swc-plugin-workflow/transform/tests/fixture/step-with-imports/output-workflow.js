import { usefulHelper// do not remove
 } from './utils';
import * as useful from './useful'; // do not remove
/**__internal_workflows{"steps":{"input.js":{"processData":{"stepId":"step//input.js//processData"}}}}*/;
export async function processData(data) {
    return globalThis[Symbol.for("WORKFLOW_USE_STEP")]("step//input.js//processData")(data);
}
export function normalFunction() {
    // since this function is exported we can't remove it
    useful.doSomething();
    return usefulHelper();
}
