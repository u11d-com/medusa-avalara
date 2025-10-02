import { MedusaContainer } from "@medusajs/framework/types";
import { AVALARA_PRODUCT_MODULE } from "../modules/avalara-product";
import AvalaraProductModuleService from "../modules/avalara-product/service";

export default async function feedAvalaraCacheJob(container: MedusaContainer) {
  const logger = container.resolve("logger");
  logger.debug(`Starting ${config.name} job...`);
  const avalaraProductService: AvalaraProductModuleService = container.resolve(
    AVALARA_PRODUCT_MODULE
  );

  await avalaraProductService.feedCache();
  logger.debug(`${config.name} job completed.`);
}

export const config = {
  name: "feed-avalara-cache",
  schedule: "*/1 * * * *", // Every minute
};
