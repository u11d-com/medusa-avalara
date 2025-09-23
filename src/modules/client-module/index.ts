import ClientService from "./service";
import { Module } from "@medusajs/framework/utils";

export const CLIENT_MODULE = "client_module";

export default Module(CLIENT_MODULE, {
  service: ClientService,
});
