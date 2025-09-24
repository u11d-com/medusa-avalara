import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import createAvalaraTransactionWorkflow from "../workflows/create-avalara-transaction";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");

  logger.debug(`Order placed event received for order: ${data.id}`);

  try {
    const result = await createAvalaraTransactionWorkflow(container).run({
      input: { orderId: data.id },
    });

    if (result.result?.success) {
      logger.info(
        `Successfully created Avalara transaction: ${result.result.message}`
      );
    } else {
      logger.error(
        `Failed to create Avalara transaction: ${
          result.result?.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    logger.error(
      `Error running Avalara transaction workflow for order ${data.id}:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
