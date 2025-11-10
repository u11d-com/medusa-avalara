import { z } from "zod";

export const PostAvalaraAddressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  line3: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
