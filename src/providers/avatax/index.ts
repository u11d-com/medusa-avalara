import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import { AvataxTaxProvider } from "./service";

export default ModuleProvider(Modules.TAX, {
  services: [AvataxTaxProvider],
});
