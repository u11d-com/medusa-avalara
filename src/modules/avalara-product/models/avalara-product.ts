import { InferTypeOf } from "@medusajs/framework/types";
import { model } from "@medusajs/framework/utils";

export const AvalaraProduct = model
  .define("avalara_product", {
    id: model.id().primaryKey(),
    tax_code: model.text().searchable(),
    product_id: model.text().index("IDX_avalara_product_id"),
  })
  .indexes([
    {
      name: "UQ_avalara_product_id_active",
      on: ["product_id"],
      where: { deleted_at: null },
      unique: true,
    },
  ]);

export type AvalaraProductModel = InferTypeOf<typeof AvalaraProduct>;

export default AvalaraProduct;
