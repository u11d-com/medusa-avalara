import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  feedAvalaraProductCacheStep,
  feedAvalaraTaxInclusiveCacheStep,
} from "./steps";

const feedAvalaraCacheWorkflow = createWorkflow(
  "feed-avalara-cache-workflow",
  function () {
    const productResult = feedAvalaraProductCacheStep();
    const taxInclusiveResult = feedAvalaraTaxInclusiveCacheStep();

    return new WorkflowResponse({
      products: productResult,
      taxInclusive: taxInclusiveResult,
    });
  }
);

export default feedAvalaraCacheWorkflow;
