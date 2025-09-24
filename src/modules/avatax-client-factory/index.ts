import { Module } from "@medusajs/framework/utils";
import { AvataxClientFactoryService } from "./service";
import avataxLoader from "./loader";

export const AVATAX_CLIENT_FACTORY_MODULE = "avatax_client_factory_module";

export default Module(AVATAX_CLIENT_FACTORY_MODULE, {
  service: AvataxClientFactoryService,
  loaders: [avataxLoader],
});
