import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import createAvalaraTransactionWorkflow from "../workflows/create-avalara-transaction";
import { logWorkflowResult } from "../utils";
import voidAvalaraTransactionWorkflow from "../workflows/void-avalara-transaction";

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  logger.debug(`Order canceled event received for order: ${data.id}`);

  const result = await voidAvalaraTransactionWorkflow(container).run({
    input: data.id,
  });

  logWorkflowResult(`order.canceled.avalara.${data.id}`, result, logger);
}

export const config: SubscriberConfig = {
  event: "order.canceled",
};
