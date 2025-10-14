import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { feedAvalaraProductCacheStep } from "./steps";

const feedAvalaraProductCacheWorkflow = createWorkflow(
  "feed-avalara-product-cache-workflow",
  function () {
    const result = feedAvalaraProductCacheStep();
    return new WorkflowResponse(result);
  }
);

export default feedAvalaraProductCacheWorkflow;
