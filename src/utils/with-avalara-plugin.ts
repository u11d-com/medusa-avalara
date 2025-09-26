import { InputConfig } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { AvalaraPluginOptions } from "../types";

export const withAvalaraPlugin = (
  config: InputConfig,
  options: AvalaraPluginOptions
) => {
  const modules = config.modules || [];
  if (!Array.isArray(modules)) {
    throw new Error("Modules in the config must be an array");
  }

  return {
    ...config,
    plugins: [...(config.plugins || []), "@u11d/medusa-avalara"],
    modules: [
      ...modules,
      {
        resolve: "@u11d/medusa-avalara/modules/avalara-product",
        dependencies: [Modules.CACHE],
      },
      {
        resolve: "@u11d/medusa-avalara/modules/avatax-factory",
        options,
        dependencies: [Modules.CACHE],
      },
      {
        resolve: "@medusajs/medusa/tax",
        options: {
          providers: [
            {
              resolve: "@u11d/medusa-avalara/providers/avatax",
              options,
            },
          ],
        },
        dependencies: [Modules.CACHE],
      },
    ],
  };
};
