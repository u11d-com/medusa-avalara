import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import feedAvalaraTaxInclusiveCacheWorkflow from "../workflows/feed-avalara-tax-inclusive-cache";

export default async function regionCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  logger.debug(`Region created event received for region: ${data.id}`);
  await feedAvalaraTaxInclusiveCacheWorkflow(container).run();
}

export const config: SubscriberConfig = {
  event: "region.created",
};
