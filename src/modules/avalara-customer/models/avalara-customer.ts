import { InferTypeOf } from "@medusajs/framework/types";
import { model } from "@medusajs/framework/utils";

export const AvalaraCustomer = model
  .define("avalara_customer", {
    id: model.id().primaryKey(),
    entity_use_code: model.text().searchable(),
    customer_id: model.text().index("IDX_avalara_customer_customer_id"),
  })
  .indexes([
    {
      name: "UQ_avalara_customer_customer_id_active",
      on: ["customer_id"],
      where: { deleted_at: null },
      unique: true,
    },
  ]);

export type AvalaraCustomerModel = InferTypeOf<typeof AvalaraCustomer>;

export default AvalaraCustomer;
