import {
  ICacheService,
  ItemTaxCalculationLine,
  ItemTaxLineDTO,
  Logger,
  ShippingTaxCalculationLine,
  ShippingTaxLineDTO,
  TaxCalculationContext,
} from "@medusajs/framework/types";
import {
  AddressInfo,
  CreateTransactionModel,
  LineItemModel,
  TransactionLineModel,
  TransactionModel,
} from "avatax/lib/models";
import { DocumentType } from "avatax/enums";
import { randomUUID } from "crypto";
import { AvataxPluginOptions } from "../types";
import { getAvalaraProductCacheKey } from "../utils";
import { AVALARA_IDENTIFIER } from "../const";

export class AvataxConverter {
  constructor(
    private readonly cache: ICacheService,
    private readonly logger: Logger,
    private readonly options: AvataxPluginOptions
  ) {}

  async toTransactionModel(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext,
    type: DocumentType
  ): Promise<CreateTransactionModel> {
    const transactionModel = new CreateTransactionModel();

    transactionModel.companyCode = this.options.client.companyCode;
    transactionModel.type = type;
    transactionModel.date = new Date();
    transactionModel.customerCode = context.customer?.id || "GUEST";
    transactionModel.currencyCode =
      itemLines[0]?.line_item.currency_code?.toUpperCase() || "USD";
    transactionModel.code = randomUUID();

    if (context.customer?.email) {
      transactionModel.email = context.customer.email;
    }

    const lines: LineItemModel[] = [];

    await Promise.all(
      itemLines.map(async ({ line_item }, index) => {
        if (!(line_item.unit_price && line_item.quantity)) {
          throw new Error(
            `Line item ${line_item.id} is missing unit price (${line_item.unit_price}) or quantity (${line_item.quantity})`
          );
        }

        const lineItem: LineItemModel = {
          number: String(index + 1),
          quantity: Number(line_item.quantity),
          amount: Number(line_item.unit_price) * Number(line_item.quantity),
          description: `Product ${line_item.product_id}`,
          itemCode: line_item.product_id,
        };

        const taxCode = await this.cache.get<string>(
          getAvalaraProductCacheKey(line_item.product_id)
        );
        this.logger.debug(
          `Tax code for product ${line_item.product_id}: ${taxCode}`
        );

        if (!taxCode && this.options.taxCodes?.throwErrorIfMissing) {
          throw new Error(
            `Missing tax code for product ${line_item.product_id}`
          );
        }

        lineItem.taxCode = taxCode || this.options.taxCodes?.default;

        lines.push(lineItem);
      })
    );

    shippingLines.forEach((shippingLine, index) => {
      const shippingLineItem: LineItemModel = {
        number: `SHIP-${index + 1}`,
        quantity: 1,
        amount: Number(shippingLine.shipping_line.unit_price || 0),
        description: "Shipping",
        taxCode: this.options.taxCodes?.shipping,
      };

      lines.push(shippingLineItem);
    });

    transactionModel.lines = lines;

    transactionModel.addresses = {
      shipFrom: this.options.shipFromAddress,
      shipTo: this.toAvataxAddress(context.address),
    };

    return transactionModel;
  }

  toAvataxAddress(address: TaxCalculationContext["address"]): AddressInfo {
    return {
      line1: address.address_1 || "",
      line2: address.address_2 || undefined,
      city: address.city || "",
      region: address.province_code || "",
      country: address.country_code?.toUpperCase() || "",
      postalCode: address.postal_code || "",
    };
  }

  toMedusaTaxLines(
    avataxTransaction: TransactionModel,
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[]
  ): (ItemTaxLineDTO | ShippingTaxLineDTO)[] {
    const taxLines: (ItemTaxLineDTO | ShippingTaxLineDTO)[] = [];

    if (!avataxTransaction.lines) {
      throw new Error("No lines returned from AvaTax transaction");
    }

    avataxTransaction.lines.forEach((avataxLine) => {
      const isShipping = avataxLine.taxCode === this.options.taxCodes?.shipping;
      const taxRate = this.calculateTaxRate(avataxLine);

      if (isShipping) {
        shippingLines.forEach((shippingLine) => {
          const shippingTaxLine: ShippingTaxLineDTO = {
            rate: taxRate,
            name: avataxLine.taxCode || "Sales Tax",
            code: avataxLine.taxCode || "ST",
            shipping_line_id: shippingLine.shipping_line.id,
            provider_id: AVALARA_IDENTIFIER,
          };
          taxLines.push(shippingTaxLine);
        });
      } else {
        const itemLine = itemLines.find(
          (line) => line.line_item.product_id === avataxLine.itemCode
        );

        if (itemLine) {
          const itemTaxLine: ItemTaxLineDTO = {
            rate: taxRate,
            name: avataxLine.taxCode || "Sales Tax",
            code: avataxLine.taxCode || "ST",
            line_item_id: itemLine.line_item.id,
            provider_id: AVALARA_IDENTIFIER,
          };
          taxLines.push(itemTaxLine);
        } else {
          throw new Error(
            `No matching item line found for AvaTax line item code ${avataxLine.itemCode}`
          );
        }
      }
    });

    return taxLines;
  }

  private calculateTaxRate(avataxLine: TransactionLineModel): number {
    if (!avataxLine.taxCalculated || !avataxLine.taxableAmount) {
      return 0;
    }

    const rate = (avataxLine.taxCalculated / avataxLine.taxableAmount) * 100;
    return Math.round(rate * 100) / 100;
  }
}
