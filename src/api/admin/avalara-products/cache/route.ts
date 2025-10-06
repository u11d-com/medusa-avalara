import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import feedAvalaraProductCacheWorkflow from "../../../../workflows/feed-avalara-product-cache";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  try {
    logger.debug(
      `POST /admin/avalara-products/cache - Initiating Avalara product cache refresh...`
    );

    await feedAvalaraProductCacheWorkflow(req.scope).run();

    res.json({
      message: "Cache refresh completed",
    });
  } catch (error) {
    logger.error(
      `POST /admin/avalara-products/cache - Internal server error: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
