import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import createAvalaraTransactionWorkflow from "../workflows/create-avalara-transaction";
import { logWorkflowResult } from "../utils";

export default async function orderCompletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  logger.debug(`Order completed event received for order: ${data.id}`);

  const result = await createAvalaraTransactionWorkflow(container).run({
    input: data.id,
  });

  logWorkflowResult(`order.completed.avalara.${data.id}`, result, logger);
}

export const config: SubscriberConfig = {
  event: "order.completed",
};
