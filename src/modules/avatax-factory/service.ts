import { MedusaService } from "@medusajs/framework/utils";
import AvaTaxClient from "avatax";
import { AvataxPluginOptions, InjectedDependencies } from "../../types";
import { AvataxConverter } from "../../services";

export class AvataxFactoryService extends MedusaService({}) {
  private readonly client: AvaTaxClient;
  private readonly converter: AvataxConverter;
  private readonly options: AvataxPluginOptions;

  constructor(container: InjectedDependencies, options: AvataxPluginOptions) {
    super(container);
    this.client = container.avataxClient;
    this.converter = new AvataxConverter(
      container.cache,
      container.logger,
      options
    );
    this.options = options;
  }

  getClient(): AvaTaxClient {
    return this.client;
  }

  getConverter(): AvataxConverter {
    return this.converter;
  }

  getCompanyCode(): string {
    return this.options.client.companyCode;
  }
}

export default AvataxFactoryService;
