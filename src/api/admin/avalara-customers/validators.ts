import { z } from "zod";
import { PaginationSchema } from "../../../utils";

export const GetAvalaraCustomersSchema = PaginationSchema;

export const PutAvalaraCustomersSchema = z.object({
  avalara_customers: z.array(
    z.object({
      customer_id: z.string(),
      entity_use_code: z.string(),
    })
  ),
});
