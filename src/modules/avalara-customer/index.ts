import { Module } from "@medusajs/framework/utils";
import { AvalaraCustomerModuleService } from "./service";

export const AVALARA_CUSTOMER_MODULE = "avalara_customer";

export default Module(AVALARA_CUSTOMER_MODULE, {
  service: AvalaraCustomerModuleService,
});
