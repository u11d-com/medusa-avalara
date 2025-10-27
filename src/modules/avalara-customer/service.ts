import { MedusaService } from "@medusajs/framework/utils";
import {
  AvalaraCustomer,
  AvalaraCustomerModel,
} from "./models/avalara-customer";
import { isValidEntityUseCode } from "../../utils";

export type BulkUpdateRequest = {
  customer_id: string;
  entity_use_code: string;
};

export type BulkUpdateResult = {
  customer_id: string;
  success?: boolean;
  error?: string;
  warning?: string;
  data?: AvalaraCustomerModel;
};

export class AvalaraCustomerModuleService extends MedusaService({
  AvalaraCustomer,
}) {
  private async upsertAvalaraCustomer(
    customer_id: string,
    entity_use_code: string
  ): Promise<AvalaraCustomerModel> {
    const [existingRecords, count] = await this.listAndCountAvalaraCustomers({
      customer_id,
    });

    if (count > 1) {
      throw new Error(`Multiple records found for customer ${customer_id}`);
    }

    let result: AvalaraCustomerModel;

    if (count === 1) {
      result = await this.updateAvalaraCustomers({
        ...existingRecords[0],
        entity_use_code,
      });
    } else {
      result = await this.createAvalaraCustomers({
        customer_id,
        entity_use_code,
      });
    }

    return result;
  }

  async bulkUpdateAvalaraCustomers(
    avalara_customers: BulkUpdateRequest[]
  ): Promise<BulkUpdateResult[]> {
    const results: BulkUpdateResult[] = [];

    for (const customerData of avalara_customers) {
      const { customer_id, entity_use_code } = customerData;

      if (!customer_id || !entity_use_code) {
        results.push({
          customer_id,
          error: "Both customer_id and entity_use_code are required",
        });
        continue;
      }

      try {
        const avalaraCustomer = await this.upsertAvalaraCustomer(
          customer_id,
          entity_use_code
        );

        results.push({
          customer_id,
          success: true,
          warning: isValidEntityUseCode(entity_use_code)
            ? undefined
            : `The entity_use_code "${entity_use_code}" is not recognized.`,
          data: avalaraCustomer,
        });
      } catch (error) {
        results.push({
          customer_id,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default AvalaraCustomerModuleService;
