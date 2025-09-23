import {
  ITaxProvider,
  ItemTaxCalculationLine,
  ItemTaxLineDTO,
  ShippingTaxCalculationLine,
  ShippingTaxLineDTO,
  TaxCalculationContext,
} from "@medusajs/framework/types";

class MyTaxProvider implements ITaxProvider {
  constructor(container, options) {
    console.log(`MyTaxProvider ${options.foo}`);
    const cache = container.cache;
  }

  static identifier = "my-tax";

  getIdentifier(): string {
    return MyTaxProvider.identifier;
  }

  getTaxLines(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    context: TaxCalculationContext
  ): Promise<(ItemTaxLineDTO | ShippingTaxLineDTO)[]> {
    return [] as any;
  }
}

export default MyTaxProvider;
