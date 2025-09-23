import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import { AvataxTaxProvider } from "./service";
import validateAvataxConnectionLoader from "./validate-avatax-connection";

export default ModuleProvider(Modules.TAX, {
  services: [AvataxTaxProvider],
  loaders: [validateAvataxConnectionLoader],
});
