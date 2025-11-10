import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import {
  GetAvalaraCustomersSchema,
  PutAvalaraCustomersSchema,
} from "./admin/avalara-customers/validators";
import {
  GetAvalaraProductsSchema,
  PutAvalaraProductsSchema,
} from "./admin/avalara-products/validators";
import { PostAvalaraAddressSchema } from "./store/avalara-address/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/avalara-customers",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetAvalaraCustomersSchema, {})],
    },
    {
      matcher: "/admin/avalara-customers",
      method: "PUT",
      middlewares: [validateAndTransformBody(PutAvalaraCustomersSchema)],
    },
    {
      matcher: "/admin/avalara-products",
      method: "GET",
      middlewares: [validateAndTransformQuery(GetAvalaraProductsSchema, {})],
    },
    {
      matcher: "/admin/avalara-products",
      method: "PUT",
      middlewares: [validateAndTransformBody(PutAvalaraProductsSchema)],
    },
    {
      matcher: "/store/avalara-address",
      method: "POST",
      middlewares: [validateAndTransformBody(PostAvalaraAddressSchema)],
    },
  ],
});
