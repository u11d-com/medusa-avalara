import { MedusaContainer } from "@medusajs/framework/types";
import feedAvalaraProductCacheWorkflow from "../workflows/feed-avalara-product-cache";

export default async function initFeedAvalaraCacheJob(
  container: MedusaContainer
) {
  const logger = container.resolve("logger");
  logger.debug(`Starting ${config.name} job...`);

  await feedAvalaraProductCacheWorkflow(container).run();

  logger.debug(`${config.name} job completed.`);
}

// on startup
export const config = {
  name: "init-feed-avalara-cache",
  schedule: "*/10 * * * * *",
  numberOfExecutions: 1,
};
