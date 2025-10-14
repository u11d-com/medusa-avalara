import { ICacheService } from "@medusajs/framework/types";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { getAvalaraTaxIncludedCacheKey } from "../../utils";
import { CACHE_TTL } from "../../const";

export const feedAvalaraTaxInclusiveCacheStep = createStep(
  "feed-avalara-tax-inclusive-cache-step",
  async (_, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const cache: ICacheService = container.resolve("cache");
    const pricingService = container.resolve("pricing");
    const regionService = container.resolve("region");

    logger.debug("Feeding Avalara tax inclusive cache...");
    let total = 0;

    try {
      const pricePreferences = await pricingService.listPricePreferences();

      logger.debug(`Found ${pricePreferences.length} price preferences`);

      for (const preference of pricePreferences) {
        if (preference.attribute === "region_id" && preference.value) {
          try {
            const region = await regionService.retrieveRegion(
              preference.value,
              {
                relations: ["countries"],
              }
            );

            if (region.countries && region.countries.length > 0) {
              await Promise.all(
                region.countries.map(async (country) => {
                  if (country.iso_2) {
                    const cacheKey = getAvalaraTaxIncludedCacheKey(
                      country.iso_2
                    );
                    await cache.set(
                      cacheKey,
                      preference.is_tax_inclusive || false,
                      CACHE_TTL
                    );

                    logger.debug(
                      `Cached tax inclusive setting for country ${country.iso_2}: ${preference.is_tax_inclusive}`
                    );
                    total++;
                  }
                })
              );
            }
          } catch (error) {
            logger.warn(
              `Failed to retrieve region ${preference.value}: ${error.message}`
            );
          }
        }
      }

      logger.info(
        `Finished feeding Avalara tax inclusive cache. Total countries cached: ${total}`
      );

      return new StepResponse({ total });
    } catch (error) {
      logger.error(
        `Failed to feed tax inclusive cache. Error: ${error.message}. Please make sure pricing and region modules are available and cache module is injected.`
      );
      throw error;
    }
  }
);
