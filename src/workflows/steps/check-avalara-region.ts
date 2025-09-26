import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Logger } from "@medusajs/medusa";
import { AVALARA_IDENTIFIER } from "../../const";

export const checkAvalaraRegionStep = createStep(
  "check-avalara-region",
  async (orderId: string, { container }) => {
    const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    try {
      const taxModuleService = container.resolve("tax");
      const orderService = container.resolve("order");

      const order = await orderService.retrieveOrder(orderId, {
        relations: ["shipping_address"],
      });

      if (!order.shipping_address?.country_code) {
        logger.debug(
          `No shipping address country code found for order ${orderId}`
        );
        return new StepResponse(false);
      }

      const taxRegions = await taxModuleService.listTaxRegions({
        country_code: order.shipping_address.country_code,
      });

      if (!taxRegions || taxRegions.length === 0) {
        logger.debug(
          `No tax regions found for country: ${order.shipping_address.country_code}`
        );
        return new StepResponse(false);
      }

      const avalaraRegion = taxRegions.find(
        (region) =>
          region.provider_id === AVALARA_IDENTIFIER ||
          region.provider_id === `tp_${AVALARA_IDENTIFIER}`
      );

      const isAvalaraConfigured = !!avalaraRegion;

      logger.debug(
        `Avalara region check for order ${orderId} (${order.shipping_address.country_code}): ${isAvalaraConfigured}`
      );

      return new StepResponse(isAvalaraConfigured);
    } catch (error) {
      logger.error(
        `Failed to check Avalara region configuration for order ${orderId}: ${error.message}`
      );

      return new StepResponse(false);
    }
  }
);
