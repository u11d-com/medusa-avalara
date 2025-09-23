import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import AvalaraProductModule from "../modules/avalara-product";

export default defineLink(ProductModule.linkable.product, {
  linkable: AvalaraProductModule.linkable.avalaraProduct,
  foreignKey: "product_id",
  primaryKey: "id",
  isList: false,
});
