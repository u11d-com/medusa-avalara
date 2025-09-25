import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { logWorkflowResult } from "../utils";
import commitAvalaraTransactionWorkflow from "../workflows/commit-avalara-transaction";

export default async function orderCompletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  logger.debug(`Order completed event received for order: ${data.id}`);

  const result = await commitAvalaraTransactionWorkflow(container).run({
    input: data.id,
  });

  logWorkflowResult(`order.completed.avalara.${data.id}`, result, logger);
}

export const config: SubscriberConfig = {
  event: "order.completed",
};
