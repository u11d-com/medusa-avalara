import { ICacheService } from "@medusajs/framework/types";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { AVALARA_CUSTOMER_MODULE } from "../../modules/avalara-customer";
import AvalaraCustomerModuleService from "../../modules/avalara-customer/service";
import { AvalaraCustomerCache } from "../../types";
import { getAvalaraCustomerCacheKey } from "../../utils";
import { CACHE_TTL, FEED_BATCH_SIZE, MAX_FEED_ITERATIONS } from "../../const";

export const feedAvalaraCustomerCacheStep = createStep(
  "feed-avalara-customer-cache-step",
  async (_, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const cache: ICacheService = container.resolve("cache");
    const avalaraCustomerService: AvalaraCustomerModuleService =
      container.resolve(AVALARA_CUSTOMER_MODULE);
    const customerService = container.resolve("customer");

    logger.debug("Feeding Avalara customer cache...");
    let total = 0;

    try {
      let skip = 0;
      let i = 0;
      let hasMore = true;

      while (hasMore && i < MAX_FEED_ITERATIONS) {
        i += 1;

        const avalaraCustomers =
          await avalaraCustomerService.listAvalaraCustomers(
            {},
            {
              skip,
              take: FEED_BATCH_SIZE,
              order: { created_at: "DESC" },
            }
          );

        logger.debug(
          `Found ${avalaraCustomers.length} avalara customers in batch ${i}`
        );

        if (avalaraCustomers.length === 0) {
          hasMore = false;
          break;
        }

        const customerIds = avalaraCustomers.map((ac) => ac.customer_id);
        const customers = await customerService.listCustomers({
          id: customerIds,
        });
        const customerMap = new Map(customers.map((c) => [c.id, c]));
        const enrichedAvalaraCustomers = avalaraCustomers.map(
          (avalaraCustomer) => ({
            ...avalaraCustomer,
            customer: customerMap.get(avalaraCustomer.customer_id),
          })
        );

        await Promise.all(
          enrichedAvalaraCustomers.map(async (avalaraCustomer) => {
            const value: AvalaraCustomerCache = {
              entity_use_code: avalaraCustomer.entity_use_code,
            };

            await cache.set(
              getAvalaraCustomerCacheKey(avalaraCustomer.customer_id),
              value,
              CACHE_TTL
            );
          })
        );

        logger.debug(
          `Fed ${avalaraCustomers.length} Avalara customers into cache (iteration ${i})`
        );

        skip += FEED_BATCH_SIZE;
        total += avalaraCustomers.length;
        hasMore = avalaraCustomers.length === FEED_BATCH_SIZE;
      }

      logger.info(
        `Finished feeding Avalara customer cache. Total customers fed: ${total}`
      );

      return new StepResponse({ total });
    } catch (error) {
      logger.error(
        `Failed to feed cache. Error: ${error.message}. Please make sure migration adding avalara_customer table has been run and cache module is injected to the module via medusa-config.`
      );
      throw error;
    }
  }
);
