import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import myWorkflow from "../workflows/my-workflow";

export default async function myHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  logger.info("Subscriber...");

  myWorkflow.run({ input: { name: "xd" } });
}

export const config: SubscriberConfig = {
  event: `cart.updated`,
};
