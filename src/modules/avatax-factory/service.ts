import { MedusaService } from "@medusajs/framework/utils";
import AvaTaxClient from "avatax";
import { AvataxPluginOptions, InjectedDependencies } from "../../types";
import { AvataxConverter } from "../../services";

export class AvataxFactoryService extends MedusaService({}) {
  private readonly client: AvaTaxClient;
  private readonly converter: AvataxConverter;

  constructor(container: InjectedDependencies, options: AvataxPluginOptions) {
    super(container);
    this.client = container.avataxClient;
    this.converter = new AvataxConverter(
      container.cache,
      container.logger,
      options
    );
  }

  getClient(): AvaTaxClient {
    return this.client;
  }

  getConverter(): AvataxConverter {
    return this.converter;
  }
}

export default AvataxFactoryService;
