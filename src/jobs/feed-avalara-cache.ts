import { MedusaContainer } from "@medusajs/framework/types";
import feedAvalaraCacheWorkflow from "../workflows/feed-avalara-cache";

export default async function feedAvalaraCacheJob(container: MedusaContainer) {
  const logger = container.resolve("logger");
  logger.debug(`Starting ${config.name} job...`);

  await feedAvalaraCacheWorkflow(container).run();

  logger.debug(`${config.name} job completed.`);
}

export const config = {
  name: "feed-avalara-cache",
  schedule: "0 0 * * *", // Every midnight
};
