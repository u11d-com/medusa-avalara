import { Module } from "@medusajs/framework/utils";
import { AvalaraProductModuleService } from "./service";

export const AVALARA_PRODUCT_MODULE = "avalara_product";

export default Module(AVALARA_PRODUCT_MODULE, {
  service: AvalaraProductModuleService,
});
