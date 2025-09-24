import { MedusaService } from "@medusajs/framework/utils";
import { ICacheService } from "@medusajs/framework/types";
import { Logger } from "@medusajs/medusa";
import { AvalaraProduct, AvalaraProductModel } from "./models/avalara-product";
import { getAvalaraProductCacheKey } from "../../utils";

export type BulkUpdateRequest = {
  product_id: string;
  tax_code: string;
};

export type BulkUpdateResult = {
  product_id: string;
  success?: boolean;
  error?: string;
  data?: AvalaraProductModel;
};

type InjectedDependencies = {
  cache: ICacheService;
  logger: Logger;
};

export class AvalaraProductModuleService extends MedusaService({
  AvalaraProduct,
}) {
  private readonly cache: ICacheService;
  private readonly logger: Logger;

  private readonly FEED_BATCH_SIZE = 1000;
  private readonly MAX_FEED_ITERATIONS = 10;
  private readonly CACHE_TTL = 10 * 365 * 24 * 60 * 60; // 10 years

  constructor(container: InjectedDependencies) {
    super(container);
    this.logger = container.logger;

    try {
      this.cache = container.cache;
      this.feedCache();
    } catch (error) {
      this.logger.warn(
        `Unable to feed Avalara product cache. Error: ${error.message}. Please make sure cache module is injected to the module via medusa-config.`
      );
    }
  }

  private async feedCache() {
    this.logger.debug("Feeding Avalara product cache...");
    let total = 0;
    try {
      let skip = 0;
      let i = 0;
      let hasMore = true;

      while (hasMore && i < this.MAX_FEED_ITERATIONS) {
        i += 1;
        const products = await this.listAvalaraProducts(undefined, {
          order: { created_at: "DESC" },
          skip,
          take: this.FEED_BATCH_SIZE,
        });

        if (products.length === 0) {
          hasMore = false;
          break;
        }

        await Promise.all(
          products.map((product) =>
            this.cache.set(
              getAvalaraProductCacheKey(product.product_id),
              product.tax_code,
              this.CACHE_TTL
            )
          )
        );

        this.logger.debug(
          `Fed ${products.length} Avalara products into cache (iteration ${i})`
        );

        skip += this.FEED_BATCH_SIZE;
        total += products.length;
        hasMore = products.length === this.FEED_BATCH_SIZE;
      }

      this.logger.info(
        `Finished feeding Avalara product cache. Total products fed: ${total}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to feed cache. Error: ${error.message}. Please make sure migration adding avalara_product table has been run and cache module is injected to the module via medusa-config.`
      );
    }
  }

  async upsertAvalaraProduct(
    product_id: string,
    tax_code: string
  ): Promise<AvalaraProductModel> {
    const [existingRecords, count] = await this.listAndCountAvalaraProducts({
      product_id,
    });

    if (count > 1) {
      throw new Error(`Multiple records found for product ${product_id}`);
    }

    let result: AvalaraProductModel;

    if (count === 1) {
      result = await this.updateAvalaraProducts({
        ...existingRecords[0],
        tax_code,
      });
    } else {
      result = await this.createAvalaraProducts({
        product_id,
        tax_code,
      });
    }

    await this.feedCache();

    return result;
  }

  async bulkUpdateAvalaraProducts(
    avalara_products: BulkUpdateRequest[]
  ): Promise<BulkUpdateResult[]> {
    const results: BulkUpdateResult[] = [];

    for (const productData of avalara_products) {
      const { product_id, tax_code } = productData;

      if (!product_id || !tax_code) {
        results.push({
          product_id,
          error: "Both product_id and tax_code are required",
        });
        continue;
      }

      try {
        const avalaraProduct = await this.upsertAvalaraProduct(
          product_id,
          tax_code
        );

        results.push({
          product_id,
          success: true,
          data: avalaraProduct,
        });
      } catch (error) {
        results.push({
          product_id,
          error: error.message,
        });
      }
    }

    await this.feedCache();

    return results;
  }
}

export default AvalaraProductModuleService;
