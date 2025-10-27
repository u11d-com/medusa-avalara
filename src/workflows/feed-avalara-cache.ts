import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  feedAvalaraProductCacheStep,
  feedAvalaraCustomerCacheStep,
  feedAvalaraTaxInclusiveCacheStep,
} from "./steps";

const feedAvalaraCacheWorkflow = createWorkflow(
  "feed-avalara-cache-workflow",
  function () {
    const productResult = feedAvalaraProductCacheStep();
    const customerResult = feedAvalaraCustomerCacheStep();
    const taxInclusiveResult = feedAvalaraTaxInclusiveCacheStep();

    return new WorkflowResponse({
      products: productResult,
      customers: customerResult,
      taxInclusive: taxInclusiveResult,
    });
  }
);

export default feedAvalaraCacheWorkflow;
