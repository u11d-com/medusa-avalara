import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import {
  AvalaraProductModuleService,
  BulkUpdateRequest,
} from "../../../modules/avalara-product/service";
import { AVALARA_PRODUCT_MODULE } from "../../../modules/avalara-product";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

type BulkUpdateAvalaraProductRequest = {
  avalara_products: BulkUpdateRequest[];
};

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const avalaraProductModuleService: AvalaraProductModuleService =
    req.scope.resolve(AVALARA_PRODUCT_MODULE);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    const offset = Number(req.query.offset || 0);
    const limit = Number(req.query.limit || 10);

    logger.debug(
      `GET /admin/avalara-products - Retrieving avalara products with offset: ${offset}, limit: ${limit}`
    );

    const [avalaraProducts, count] =
      await avalaraProductModuleService.listAndCountAvalaraProducts(undefined, {
        skip: offset,
        take: limit,
        order: { created_at: "DESC" },
      });

    logger.debug(
      `GET /admin/avalara-products - Successfully retrieved ${avalaraProducts.length} of ${count} avalara products`
    );

    res.json({
      avalara_products: avalaraProducts,
      count,
      offset,
      limit,
    });
  } catch (error) {
    logger.error(
      `GET /admin/avalara-products - Failed to retrieve avalara products: ${error.message}`
    );

    res.status(500).json({
      error: "Failed to retrieve Avalara products",
      details: error.message,
    });
  }
}

export async function PUT(
  req: MedusaRequest<BulkUpdateAvalaraProductRequest>,
  res: MedusaResponse
): Promise<void> {
  const avalaraProductModuleService: AvalaraProductModuleService =
    req.scope.resolve(AVALARA_PRODUCT_MODULE);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  const { avalara_products } = req.body;

  logger.debug(
    `PUT /admin/avalara-products - Starting bulk update for ${
      avalara_products?.length || 0
    } products`
  );

  if (!avalara_products || !Array.isArray(avalara_products)) {
    logger.error(
      "PUT /admin/avalara-products - Invalid request: Products array is required"
    );
    res.status(400).json({
      error: "Products array is required",
    });
    return;
  }

  try {
    logger.debug(
      `PUT /admin/avalara-products - Processing ${avalara_products.length} product updates`
    );

    const results = await avalaraProductModuleService.bulkUpdateAvalaraProducts(
      avalara_products
    );

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => r.error).length;

    logger.info(
      `PUT /admin/avalara-products - Bulk update completed: ${successCount} successful, ${errorCount} failed`
    );

    res.json({
      message: "Bulk update completed",
      results,
    });
  } catch (error) {
    logger.error(
      `PUT /admin/avalara-products - Internal server error: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
