import { model } from "@medusajs/framework/utils";

const MyModel = model.define("model", {
  id: model.id().primaryKey(),
  title: model.text(),
});

export default MyModel;
