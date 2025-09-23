import { MedusaService } from "@medusajs/framework/utils";

class ClientService extends MedusaService({}) {
  constructor(container, options) {
    super(container);
    console.log(`ClientService ${options.foo}`);
    const cache = container.cache;
  }

  myFunc() {
    console.log("myFunc");
  }
}

export default ClientService;
