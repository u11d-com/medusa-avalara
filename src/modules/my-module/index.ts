import MyService from "./my-service";
import { Module } from "@medusajs/framework/utils";

export const MY_MODULE = "my_module";

export default Module(MY_MODULE, {
  service: MyService,
});
