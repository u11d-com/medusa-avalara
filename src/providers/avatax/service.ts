import {
  ITaxProvider,
  ItemTaxCalculationLine,
  ItemTaxLineDTO,
  ShippingTaxCalculationLine,
  ShippingTaxLineDTO,
  TaxCalculationContext,
  Logger,
  ICacheService,
} from "@medusajs/framework/types";
import { DocumentType } from "avatax/lib/enums";
import { AvataxPluginOptions } from "../../types";
import {
  AvataxClient,
  AvataxConverter,
  AvataxOptionsValidator,
} from "../../services";
import { AVALARA_IDENTIFIER } from "../../const";

type InjectedDependencies = {
  logger: Logger;
  cache: ICacheService; // It's required to add `dependencies: [Modules.CACHE]` to `medusa-config` to use the cache module
};

export class AvataxTaxProvider implements ITaxProvider {
  private readonly logger: Logger;
  private readonly cache: ICacheService;
  private readonly client: AvataxClient;
  private readonly converter: AvataxConverter;

  static identifier = AVALARA_IDENTIFIER;

  constructor(
    container: InjectedDependencies,
    private readonly options: AvataxPluginOptions
  ) {
    AvataxOptionsValidator.validateOptions(options);

    this.logger = container.logger;
    this.cache = container.cache;

    if (!this.options.taxCodes) {
      this.options.taxCodes = {};
    }

    if (!this.options.taxCodes.shipping) {
      this.options.taxCodes.shipping = "FR020100";
    }

    if (typeof this.options.taxCodes.throwErrorIfMissing !== "boolean") {
      this.options.taxCodes.throwErrorIfMissing = true;
    }

    this.client = new AvataxClient(this.logger, this.options.client);
    this.converter = new AvataxConverter(this.cache, this.logger, this.options);

    this.logger.info("AvataxTaxProvider initialized");
  }

  getIdentifier(): string {
    return AvataxTaxProvider.identifier;
  }

  async getTaxLines(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext
  ): Promise<(ItemTaxLineDTO | ShippingTaxLineDTO)[]> {
    this.logger.debug(
      `Starting tax calculation with AvaTax for ${itemLines.length} item lines and ${shippingLines.length} shipping lines. Postal code: ${context.address.postal_code}`
    );

    if (itemLines.length === 0 && shippingLines.length === 0) {
      this.logger.debug(
        "No item or shipping lines provided for tax calculation"
      );
      return [];
    }

    if (!this.isAddressProvided(context)) {
      return this.getEmptyTaxLines(itemLines, shippingLines);
    }

    const client = this.client.getClient();
    if (!client) {
      throw new Error("AvaTax client not available");
    }

    const transactionModel = await this.converter.toTransactionModel(
      itemLines,
      shippingLines,
      context,
      DocumentType.SalesOrder
    );

    this.logger.debug("Sending tax calculation request to AvaTax");
    const avataxTransaction = await client.createTransaction({
      model: transactionModel,
    });

    const taxLines = this.converter.toMedusaTaxLines(
      avataxTransaction,
      itemLines,
      shippingLines
    );

    this.logger.debug("Tax calculation completed successfully");

    return taxLines;
  }

  private isAddressProvided(context: TaxCalculationContext): boolean {
    if (!context.address) {
      this.logger.debug("No address provided for tax calculation");
      return false;
    }

    const address = context.address;
    if (
      !(
        address.city &&
        address.province_code &&
        address.postal_code &&
        address.country_code
      )
    ) {
      this.logger.debug(
        `Missing required address fields: ${address.city}, ${address.province_code}, ${address.postal_code}, ${address.country_code}`
      );
      return false;
    }

    return true;
  }

  private getEmptyTaxLines(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[]
  ): Array<ItemTaxLineDTO | ShippingTaxLineDTO> {
    const taxLines: Array<ItemTaxLineDTO | ShippingTaxLineDTO> = [];

    itemLines.forEach((itemLine) => {
      itemLine.rates.forEach((rate) => {
        const itemTaxLine: ItemTaxLineDTO = {
          rate_id: rate.id,
          rate: 0,
          name: rate.name,
          code: rate.code || "ST",
          line_item_id: itemLine.line_item.id,
          provider_id: this.getIdentifier(),
        };
        taxLines.push(itemTaxLine);
      });
    });

    shippingLines.forEach((shippingLine) => {
      shippingLine.rates.forEach((rate) => {
        const shippingTaxLine: ShippingTaxLineDTO = {
          rate_id: rate.id,
          rate: 0,
          name: rate.name,
          code: rate.code || "ST",
          shipping_line_id: shippingLine.shipping_line.id,
          provider_id: this.getIdentifier(),
        };
        taxLines.push(shippingTaxLine);
      });
    });

    return taxLines;
  }
}

export default AvataxTaxProvider;
