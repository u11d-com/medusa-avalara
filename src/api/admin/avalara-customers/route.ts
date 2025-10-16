import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  AvalaraCustomerModuleService,
  BulkUpdateRequest,
} from "../../../modules/avalara-customer/service";
import { AVALARA_CUSTOMER_MODULE } from "../../../modules/avalara-customer";
import feedAvalaraCustomerCacheWorkflow from "../../../workflows/feed-avalara-customer-cache";

type BulkUpdateAvalaraCustomerRequest = {
  avalara_customers: BulkUpdateRequest[];
};

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const avalaraCustomerModuleService: AvalaraCustomerModuleService =
    req.scope.resolve(AVALARA_CUSTOMER_MODULE);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    const offset = Number(req.query.offset || 0);
    const limit = Number(req.query.limit || 10);

    logger.debug(
      `GET /admin/avalara-customers - Retrieving avalara customers with offset: ${offset}, limit: ${limit}`
    );

    const [avalaraCustomers, count] =
      await avalaraCustomerModuleService.listAndCountAvalaraCustomers(
        undefined,
        {
          skip: offset,
          take: limit,
          order: { created_at: "DESC" },
        }
      );

    logger.debug(
      `GET /admin/avalara-customers - Successfully retrieved ${avalaraCustomers.length} of ${count} avalara customers`
    );

    res.json({
      avalara_customers: avalaraCustomers,
      count,
      offset,
      limit,
    });
  } catch (error) {
    logger.error(
      `GET /admin/avalara-customers - Failed to retrieve avalara customers: ${error.message}`
    );

    res.status(500).json({
      error: "Failed to retrieve Avalara customers",
      details: error.message,
    });
  }
}

export async function PUT(
  req: MedusaRequest<BulkUpdateAvalaraCustomerRequest>,
  res: MedusaResponse
): Promise<void> {
  const avalaraCustomerModuleService: AvalaraCustomerModuleService =
    req.scope.resolve(AVALARA_CUSTOMER_MODULE);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  const { avalara_customers } = req.body;

  logger.debug(
    `PUT /admin/avalara-customers - Starting bulk update for ${
      avalara_customers?.length || 0
    } customers`
  );

  if (!avalara_customers || !Array.isArray(avalara_customers)) {
    logger.error(
      "PUT /admin/avalara-customers - Invalid request: Customers array is required"
    );
    res.status(400).json({
      error: "Customers array is required",
    });
    return;
  }

  try {
    logger.debug(
      `PUT /admin/avalara-customers - Processing ${avalara_customers.length} customer updates`
    );

    const results =
      await avalaraCustomerModuleService.bulkUpdateAvalaraCustomers(
        avalara_customers
      );

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => r.error).length;
    const warningCount = results.filter((r) => r.warning).length;

    await feedAvalaraCustomerCacheWorkflow(req.scope).run();

    logger.info(
      `PUT /admin/avalara-customers - Bulk update completed: ${successCount} successful, ${errorCount} failed, ${warningCount} warnings`
    );

    res.json({
      message: "Bulk update completed",
      results,
    });
  } catch (error) {
    logger.error(
      `PUT /admin/avalara-customers - Internal server error: ${error.message}`
    );
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
