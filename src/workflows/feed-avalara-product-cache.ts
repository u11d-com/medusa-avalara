import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Logger, ICacheService } from "@medusajs/framework/types";
import { AVALARA_PRODUCT_MODULE } from "../modules/avalara-product";
import AvalaraProductModuleService from "../modules/avalara-product/service";
import { getAvalaraProductCacheKey } from "../utils";
import { AvalaraProductCache } from "../types";

const FEED_BATCH_SIZE = 1000;
const MAX_FEED_ITERATIONS = 1000; // max 1,000,000 records - to prevent infinite loops
const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days - `cache` requires TTL (-1 is invalid, 0 immediate expiry)

const feedAvalaraProductCacheStep = createStep(
  "feed-avalara-product-cache-step",
  async (_, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const cache: ICacheService = container.resolve("cache");
    const avalaraProductService: AvalaraProductModuleService =
      container.resolve(AVALARA_PRODUCT_MODULE);
    const productService = container.resolve("product");

    logger.debug("Feeding Avalara product cache...");
    let total = 0;

    try {
      let skip = 0;
      let i = 0;
      let hasMore = true;

      while (hasMore && i < MAX_FEED_ITERATIONS) {
        i += 1;

        const avalaraProducts = await avalaraProductService.listAvalaraProducts(
          {},
          {
            skip,
            take: FEED_BATCH_SIZE,
            order: { created_at: "DESC" },
          }
        );

        logger.debug(
          `Found ${avalaraProducts.length} avalara products in batch ${i}`
        );

        if (avalaraProducts.length === 0) {
          hasMore = false;
          break;
        }

        const productIds = avalaraProducts.map((ap) => ap.product_id);
        const products = await productService.listProducts({ id: productIds });
        const productMap = new Map(products.map((p) => [p.id, p]));
        const enrichedAvalaraProducts = avalaraProducts.map(
          (avalaraProduct) => ({
            ...avalaraProduct,
            product: productMap.get(avalaraProduct.product_id),
          })
        );

        await Promise.all(
          enrichedAvalaraProducts.map(async (avalaraProduct) => {
            const value: AvalaraProductCache = {
              title:
                avalaraProduct.product?.title ||
                `Product ${avalaraProduct.product_id}`,
              tax_code: avalaraProduct.tax_code,
            };

            await cache.set(
              getAvalaraProductCacheKey(avalaraProduct.product_id),
              value,
              CACHE_TTL
            );
          })
        );

        logger.debug(
          `Fed ${avalaraProducts.length} Avalara products into cache (iteration ${i})`
        );

        skip += FEED_BATCH_SIZE;
        total += avalaraProducts.length;
        hasMore = avalaraProducts.length === FEED_BATCH_SIZE;
      }

      logger.info(
        `Finished feeding Avalara product cache. Total products fed: ${total}`
      );

      return new StepResponse({ total });
    } catch (error) {
      logger.error(
        `Failed to feed cache. Error: ${error.message}. Please make sure migration adding avalara_product table has been run and cache module is injected to the module via medusa-config.`
      );
      throw error;
    }
  }
);

const feedAvalaraProductCacheWorkflow = createWorkflow(
  "feed-avalara-product-cache-workflow",
  function () {
    const result = feedAvalaraProductCacheStep();
    return new WorkflowResponse(result);
  }
);

export default feedAvalaraProductCacheWorkflow;
