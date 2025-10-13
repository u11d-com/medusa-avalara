import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { feedAvalaraTaxInclusiveCacheStep } from "./steps";

const feedAvalaraTaxInclusiveCacheWorkflow = createWorkflow(
  "feed-avalara-tax-inclusive-cache-workflow",
  function () {
    const result = feedAvalaraTaxInclusiveCacheStep();
    return new WorkflowResponse(result);
  }
);

export default feedAvalaraTaxInclusiveCacheWorkflow;
