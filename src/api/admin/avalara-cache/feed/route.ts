import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import feedAvalaraCacheWorkflow from "../../../../workflows/feed-avalara-cache";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    logger.debug(
      `POST /admin/avalara-cache/feed - Initiating Avalara cache refresh (products, customers + tax inclusive settings)...`
    );

    const result = await feedAvalaraCacheWorkflow(req.scope).run();

    logger.info("Manual Avalara cache feed completed successfully");

    res.json({
      message: "Cache refresh completed successfully",
      result,
    });
  } catch (error) {
    logger.error(
      `POST /admin/avalara-cache/feed - Internal server error: ${error.message}`
    );

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
