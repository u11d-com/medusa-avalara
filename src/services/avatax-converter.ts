import {
  CustomerDTO,
  ICacheService,
  ItemTaxCalculationLine,
  ItemTaxLineDTO,
  Logger,
  OrderDTO,
  ShippingTaxCalculationLine,
  ShippingTaxLineDTO,
  TaxCalculationContext,
} from "@medusajs/framework/types";
import {
  AddressInfo,
  CreateTransactionModel,
  LineItemModel,
  TransactionModel,
} from "avatax/lib/models";
import { DocumentType } from "avatax/enums";
import { randomUUID } from "crypto";
import {
  AvalaraCustomerCache,
  AvalaraPluginOptions,
  AvalaraProductCache,
} from "../types";
import {
  getAvalaraCustomerCacheKey,
  getAvalaraProductCacheKey,
  getAvalaraTaxIncludedCacheKey,
} from "../utils";
import { AVALARA_IDENTIFIER } from "../const";

export class AvataxConverter {
  constructor(
    private readonly cache: ICacheService,
    private readonly logger: Logger,
    private readonly options: AvalaraPluginOptions
  ) {}

  async toTransactionModel(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext,
    type: DocumentType.SalesOrder
  ): Promise<CreateTransactionModel>;
  async toTransactionModel(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext,
    type: DocumentType.SalesInvoice,
    orderId: string
  ): Promise<CreateTransactionModel>;
  async toTransactionModel(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext,
    type: DocumentType,
    orderId?: string
  ): Promise<CreateTransactionModel> {
    const [taxIncludedCache, avalaraCustomerCache] = await Promise.all([
      this.cache.get<boolean>(
        getAvalaraTaxIncludedCacheKey(context.address.country_code)
      ),
      context.customer?.id
        ? this.cache.get<AvalaraCustomerCache>(
            getAvalaraCustomerCacheKey(context.customer.id)
          )
        : null,
    ]);

    const taxIncluded = taxIncludedCache ?? false;
    const entityUseCode = avalaraCustomerCache?.entity_use_code;

    const transactionModel = new CreateTransactionModel();

    transactionModel.companyCode = this.options.client.companyCode;
    transactionModel.type = type;
    transactionModel.date = new Date();
    transactionModel.customerCode = context.customer?.id || "GUEST";
    (
      itemLines[0]?.line_item.currency_code ||
      shippingLines[0]?.shipping_line.currency_code
    )?.toUpperCase() || "USD";
    transactionModel.code = orderId || randomUUID();
    transactionModel.entityUseCode = entityUseCode;

    if (context.customer?.email) {
      transactionModel.email = context.customer.email;
    }

    const lines: LineItemModel[] = [];

    await Promise.all(
      itemLines.map(async ({ line_item }) => {
        if (!(line_item.unit_price && line_item.quantity)) {
          throw new Error(
            `Line item ${line_item.id} is missing unit price (${line_item.unit_price}) or quantity (${line_item.quantity})`
          );
        }

        const lineItem: LineItemModel = {
          number: line_item.id,
          quantity: Number(line_item.quantity),
          amount: Number(line_item.unit_price) * Number(line_item.quantity),
          itemCode: line_item.product_id,
          taxIncluded,
          entityUseCode,
        };

        const avalaraProductCache = await this.cache.get<AvalaraProductCache>(
          getAvalaraProductCacheKey(line_item.product_id)
        );
        this.logger.debug(
          `Tax code for product ${line_item.product_id} (${avalaraProductCache?.title}): ${avalaraProductCache?.tax_code}`
        );

        lineItem.taxCode =
          avalaraProductCache?.tax_code || this.options.taxCodes?.default;

        lineItem.description =
          avalaraProductCache?.title || `Product ${line_item.product_id}`;

        if (!lineItem.taxCode) {
          throw new Error(
            `No tax code found for product ${line_item.product_id} and no default tax code set`
          );
        }

        lines.push(lineItem);
      })
    );

    shippingLines.forEach(({ shipping_line }) => {
      const shippingLineItem: LineItemModel = {
        number: shipping_line.id,
        quantity: 1,
        amount: Number(shipping_line.unit_price || 0),
        description: "Shipping",
        taxCode: this.options.taxCodes?.shipping,
        taxIncluded,
        entityUseCode,
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

  private validateOrderAddress(
    order: OrderDTO
  ): TaxCalculationContext["address"] {
    if (!order.shipping_address) {
      throw new Error(`Order ${order.id} does not have a shipping address`);
    }

    if (!order.shipping_address.country_code) {
      throw new Error(
        `Order ${order.id} does not have a valid country code in the shipping address`
      );
    }

    if (!order.shipping_address.country_code) {
      throw new Error(
        `Order ${order.id} does not have a valid country code in the shipping address`
      );
    }

    return {
      ...order.shipping_address,
      // the following is a fallback for type safety, but should never happen due to the checks above
      country_code: order.shipping_address.country_code || "us",
    };
  }

  toTaxCalculationContext(
    order: OrderDTO,
    customer: CustomerDTO
  ): TaxCalculationContext {
    const address = this.validateOrderAddress(order);

    const context: TaxCalculationContext = {
      address,
      customer: customer
        ? {
            id: customer.id,
            email: customer.email,
            customer_groups: [],
          }
        : undefined,
    };

    return context;
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

      avataxLine.details?.forEach((detail) => {
        const commonData = {
          rate: (detail.rate ?? 0) * 100,
          name: detail.taxName ?? "Sales Tax",
          code:
            avataxLine.taxCode ||
            detail.rateTypeCode ||
            detail.signatureCode ||
            "ST",
          provider_id: AVALARA_IDENTIFIER,
        };

        if (isShipping) {
          shippingLines.forEach((shippingLine) => {
            const shippingTaxLine: ShippingTaxLineDTO = {
              ...commonData,
              shipping_line_id: shippingLine.shipping_line.id,
            };
            taxLines.push(shippingTaxLine);
          });
        } else {
          const itemLine = itemLines.find(
            (line) => line.line_item.product_id === avataxLine.itemCode
          );

          if (itemLine) {
            const itemTaxLine: ItemTaxLineDTO = {
              ...commonData,
              line_item_id: itemLine.line_item.id,
            };
            taxLines.push(itemTaxLine);
          } else {
            throw new Error(
              `No matching item line found for AvaTax line item code ${avataxLine.itemCode}`
            );
          }
        }
      });
    });

    return taxLines;
  }
}
