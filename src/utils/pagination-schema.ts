import { z } from "zod";

export const PaginationSchema = z.object({
  offset: z.preprocess((val) => {
    if (val && typeof val === "string") {
      return parseInt(val);
    }
    return val;
  }, z.number().optional().default(0)),
  limit: z.preprocess((val) => {
    if (val && typeof val === "string") {
      return parseInt(val);
    }
    return val;
  }, z.number().optional().default(10)),
});
