import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { feedAvalaraLocationCacheStep } from "./steps";

const feedAvalaraLocationCacheWorkflow = createWorkflow(
  "feed-avalara-location-cache-workflow",
  function () {
    const result = feedAvalaraLocationCacheStep();
    return new WorkflowResponse(result);
  }
);

export default feedAvalaraLocationCacheWorkflow;
