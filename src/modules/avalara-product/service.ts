import { MedusaService } from "@medusajs/framework/utils";
import { AvalaraProduct, AvalaraProductModel } from "./models/avalara-product";
import { MedusaContainer } from "@medusajs/framework";

export type BulkUpdateRequest = {
  product_id: string;
  tax_code: string;
};

export type BulkUpdateResult = {
  product_id: string;
  success?: boolean;
  error?: string;
  data?: AvalaraProductModel;
};

export class AvalaraProductModuleService extends MedusaService({
  AvalaraProduct,
}) {
  private readonly container: MedusaContainer;

  constructor(container: MedusaContainer) {
    super(container);
    this.container = container;
  }

  private async upsertAvalaraProduct(
    product_id: string,
    tax_code: string
  ): Promise<AvalaraProductModel> {
    const [existingRecords, count] = await this.listAndCountAvalaraProducts({
      product_id,
    });

    if (count > 1) {
      throw new Error(`Multiple records found for product ${product_id}`);
    }

    let result: AvalaraProductModel;

    if (count === 1) {
      result = await this.updateAvalaraProducts({
        ...existingRecords[0],
        tax_code,
      });
    } else {
      result = await this.createAvalaraProducts({
        product_id,
        tax_code,
      });
    }

    return result;
  }

  async bulkUpdateAvalaraProducts(
    avalara_products: BulkUpdateRequest[]
  ): Promise<BulkUpdateResult[]> {
    const results: BulkUpdateResult[] = [];

    for (const productData of avalara_products) {
      const { product_id, tax_code } = productData;
      try {
        const avalaraProduct = await this.upsertAvalaraProduct(
          product_id,
          tax_code
        );

        results.push({
          product_id,
          success: true,
          data: avalaraProduct,
        });
      } catch (error) {
        results.push({
          product_id,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default AvalaraProductModuleService;
