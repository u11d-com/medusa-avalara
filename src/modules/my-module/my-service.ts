import { MedusaService } from "@medusajs/framework/utils";
import MyModel from "./my-model";

class ModelModuleService extends MedusaService({
  MyModel,
}) {
  constructor(container, options) {
    super(container);
    console.log(`ModelModuleService ${options.foo}`);
    const cache = container.cache;
  }
}

export default ModelModuleService;
