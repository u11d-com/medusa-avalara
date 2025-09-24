import { Module } from "@medusajs/framework/utils";
import { AvataxFactoryService } from "./service";
import avataxFactoryLoader from "./loader";

export const AVATAX_FACTORY_MODULE = "avatax_factory_module";

export default Module(AVATAX_FACTORY_MODULE, {
  service: AvataxFactoryService,
  loaders: [avataxFactoryLoader],
});
