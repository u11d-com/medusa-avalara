import { ICacheService, Logger } from "@medusajs/framework/types";
import AvaTaxClient from "avatax/lib/AvaTaxClient";

export type InjectedDependencies = {
  logger: Logger;
  /**
   * It's required to add `dependencies: [Modules.CACHE]` to `medusa-config` to use the cache module
   */
  cache: ICacheService;
  avataxClient: AvaTaxClient;
};
