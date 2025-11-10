import { z } from "zod";
import { PaginationSchema } from "../../../utils";

export const GetAvalaraProductsSchema = PaginationSchema;

export const PutAvalaraProductsSchema = z.object({
  avalara_products: z.array(
    z.object({
      product_id: z.string(),
      tax_code: z.string(),
    })
  ),
});
