import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { LocationModel } from "avatax/lib/models/LocationModel";
import { AddressCategoryId, AddressTypeId } from "avatax/lib/enums";
import { getAvalaraLocationCacheKey, hasAddressChanged } from "../../utils";
import { CACHE_TTL } from "../../const";
import { AVATAX_FACTORY_MODULE } from "../../modules/avatax-factory";
import { AvataxFactoryService } from "../../modules/avatax-factory/service";
import { AvalaraLocationCache } from "../../types";

export const feedAvalaraLocationCacheStep = createStep(
  "feed-avalara-location-cache-step",
  async (_, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const cache = container.resolve("cache");
    const locationService = container.resolve("stock_location");
    const avataxFactory: AvataxFactoryService = container.resolve(
      AVATAX_FACTORY_MODULE
    );

    logger.debug("Feeding Avalara location cache...");

    let created = 0;
    let create_errors = 0;
    let updated = 0;
    let update_errors = 0;
    let missing_country_code = 0;
    let cache_updated = 0;
    let skipped = 0;

    try {
      const client = avataxFactory.getClient();
      const options = avataxFactory.getOptions();
      const converter = avataxFactory.getConverter();
      const companyId = options.client.companyId;

      const stockLocations = await locationService.listStockLocations(
        {},
        {
          relations: ["address"],
        }
      );
      logger.debug(`Found ${stockLocations.length} Medusa stock locations`);

      const avalaraLocationsResponse = await client.listLocationsByCompany({
        companyId,
      });
      const avalaraLocations = avalaraLocationsResponse.value || [];
      logger.debug(
        `Found ${avalaraLocations.length} existing Avalara locations`
      );

      const avalaraLocationMap = new Map<string, LocationModel>();
      avalaraLocations.forEach((loc) => {
        if (loc.locationCode) {
          avalaraLocationMap.set(loc.locationCode, loc);
        }
      });

      for (const stockLocation of stockLocations) {
        if (!stockLocation.address?.country_code) {
          logger.warn(
            `Stock location ${stockLocation.id} (${stockLocation.name}) does not have a country code, skipping`
          );
          missing_country_code++;
          continue;
        }

        const countryCode = stockLocation.address.country_code.toLowerCase();
        const provinceCode = stockLocation.address.province?.toLowerCase();

        if (avalaraLocationMap.has(stockLocation.id)) {
          const avalaraLocation = avalaraLocationMap.get(stockLocation.id)!;
          const newAddress = converter.toAvataxAddress(stockLocation.address);
          const addressChanged = hasAddressChanged(avalaraLocation, newAddress);

          if (!addressChanged) {
            logger.debug(
              `Avalara location ${stockLocation.id} already exists with same address, skipping`
            );
            skipped++;
            continue;
          }

          logger.debug(
            `Address changed for Avalara location ${stockLocation.id}, updating...`
          );

          try {
            await client.updateLocation({
              companyId,
              id: avalaraLocation.id,
              model: {
                ...avalaraLocation,
                ...newAddress,
              },
            });

            logger.info(
              `Successfully updated Avalara location: ${stockLocation.name} (${stockLocation.id})`
            );

            updated++;
          } catch (error) {
            logger.error(
              `Failed to update Avalara location ${stockLocation.name} (${stockLocation.id}): ${error.message}`
            );

            update_errors++;
            continue;
          }
        } else {
          logger.debug(
            `Creating new Avalara location: ${stockLocation.id} for stock location ${stockLocation.name}`
          );

          const idSuffix = stockLocation.id.slice(-16);
          const hash = Buffer.from(idSuffix).toString("hex");
          const id = parseInt(hash, 16) % 1024 ** 2;

          const newLocation: LocationModel[] = [
            {
              id,
              companyId,
              locationCode: stockLocation.id,
              description: stockLocation.name,
              addressTypeId: AddressTypeId.Location,
              addressCategoryId: AddressCategoryId.Warehouse,
              line1: stockLocation.address.address_1 || "",
              line2: stockLocation.address.address_2 || undefined,
              city: stockLocation.address.city || "",
              region: provinceCode || "",
              country: countryCode,
              postalCode: stockLocation.address.postal_code || "",
              isDefault: false,
              isRegistered: true,
              outletName: stockLocation.name,
              effectiveDate: new Date(),
            },
          ];

          try {
            await client.createLocations({ companyId, model: newLocation });
            logger.info(
              `Successfully created Avalara location: ${stockLocation.name} (${stockLocation.id})`
            );
            created++;
          } catch (error) {
            logger.error(
              `Failed to create Avalara location ${stockLocation.name} (${stockLocation.id}): ${error.message}`
            );
            create_errors++;
            continue;
          }
        }

        const cacheValue: AvalaraLocationCache = {
          locationCode: stockLocation.id,
          address: converter.toAvataxAddress(stockLocation.address),
        };

        if (provinceCode) {
          await cache.set(
            getAvalaraLocationCacheKey(countryCode, provinceCode),
            cacheValue,
            CACHE_TTL
          );
          logger.debug(
            `Cached location mapping for ${countryCode}_${provinceCode}: ${cacheValue.locationCode}`
          );
        }

        await cache.set(
          getAvalaraLocationCacheKey(countryCode),
          cacheValue,
          CACHE_TTL
        );
        logger.debug(
          `Cached location mapping for ${countryCode}: ${cacheValue.locationCode}`
        );

        cache_updated++;
      }

      logger.info(
        `Finished feeding Avalara location cache. Created: ${created}, Create Errors: ${create_errors}, Updated: ${updated}, Update Errors: ${update_errors}, Cache Updated: ${cache_updated}, Skipped: ${skipped}, Missing Country Code: ${missing_country_code}`
      );

      return new StepResponse({
        created,
        create_errors,
        updated,
        update_errors,
        cache_updated,
        skipped,
        missing_country_code,
      });
    } catch (error) {
      logger.error(`Failed to feed location cache. Error: ${error.message}`);
      throw error;
    }
  }
);
