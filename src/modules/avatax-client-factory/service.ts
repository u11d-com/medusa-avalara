import { MedusaService } from "@medusajs/framework/utils";
import AvaTaxClient from "avatax";
import { InjectedDependencies } from "../../types";

export class AvataxClientFactoryService extends MedusaService({}) {
  private readonly client: AvaTaxClient;

  constructor(container: InjectedDependencies) {
    super(container);
    this.client = container.avataxClient;
  }

  getClient(): AvaTaxClient {
    return this.client;
  }
}

export default AvataxClientFactoryService;
