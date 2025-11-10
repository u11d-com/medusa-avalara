import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  AvalaraCustomerModuleService,
  BulkUpdateRequest,
} from "../../../modules/avalara-customer/service";
import { AVALARA_CUSTOMER_MODULE } from "../../../modules/avalara-customer";
import feedAvalaraCustomerCacheWorkflow from "../../../workflows/feed-avalara-customer-cache";
import { z } from "zod";
import {
  GetAvalaraCustomersSchema,
  PutAvalaraCustomersSchema,
} from "./validators";

type GetAvalaraCustomersType = z.infer<typeof GetAvalaraCustomersSchema>;
type PutAvalaraCustomersType = z.infer<typeof PutAvalaraCustomersSchema>;

export async function GET(
  req: MedusaRequest<GetAvalaraCustomersType>,
  res: MedusaResponse
): Promise<void> {
  const avalaraCustomerModuleService: AvalaraCustomerModuleService =
    req.scope.resolve(AVALARA_CUSTOMER_MODULE);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    const { offset, limit } = req.validatedQuery;

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
  req: MedusaRequest<PutAvalaraCustomersType>,
  res: MedusaResponse
): Promise<void> {
  const avalaraCustomerModuleService: AvalaraCustomerModuleService =
    req.scope.resolve(AVALARA_CUSTOMER_MODULE);
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  const { avalara_customers } = req.validatedBody;

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

    const { successCount, errorCount, warningCount } = results.reduce(
      (acc, r) => ({
        successCount: acc.successCount + (r.success ? 1 : 0),
        errorCount: acc.errorCount + (r.error ? 1 : 0),
        warningCount: acc.warningCount + (r.warning ? 1 : 0),
      }),
      { successCount: 0, errorCount: 0, warningCount: 0 }
    );

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
