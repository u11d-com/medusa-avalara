import { MedusaContainer } from "@medusajs/framework/types";
import feedAvalaraCacheWorkflow from "../workflows/feed-avalara-cache";

export default async function initFeedAvalaraCacheJob(
  container: MedusaContainer
) {
  const logger = container.resolve("logger");
  logger.debug(`Starting ${config.name} job...`);

  await feedAvalaraCacheWorkflow(container).run();

  logger.debug(`${config.name} job completed.`);
}

// on startup
export const config = {
  name: "init-feed-avalara-cache",
  schedule: "*/10 * * * * *",
  numberOfExecutions: 1,
};
