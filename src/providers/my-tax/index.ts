import MyTaxProvider from "./service";
import { ModuleProvider, Modules } from "@medusajs/framework/utils";

export default ModuleProvider(Modules.TAX, {
  services: [MyTaxProvider],
});
