import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  feedAvalaraProductCacheStep,
  feedAvalaraCustomerCacheStep,
  feedAvalaraTaxInclusiveCacheStep,
  feedAvalaraLocationCacheStep,
} from "./steps";

const feedAvalaraCacheWorkflow = createWorkflow(
  "feed-avalara-cache-workflow",
  function () {
    const productResult = feedAvalaraProductCacheStep();
    const customerResult = feedAvalaraCustomerCacheStep();
    const taxInclusiveResult = feedAvalaraTaxInclusiveCacheStep();
    const locationResult = feedAvalaraLocationCacheStep();

    return new WorkflowResponse({
      products: productResult,
      customers: customerResult,
      taxInclusive: taxInclusiveResult,
      locations: locationResult,
    });
  }
);

export default feedAvalaraCacheWorkflow;
