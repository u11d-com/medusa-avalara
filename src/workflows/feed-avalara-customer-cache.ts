import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { feedAvalaraCustomerCacheStep } from "./steps";

const feedAvalaraCustomerCacheWorkflow = createWorkflow(
  "feed-avalara-customer-cache-workflow",
  function () {
    const result = feedAvalaraCustomerCacheStep();
    return new WorkflowResponse(result);
  }
);

export default feedAvalaraCustomerCacheWorkflow;
