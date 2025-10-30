import { AvataxClientOptions } from "./avatax-client-options";

export type AvalaraPluginOptions = {
  client: AvataxClientOptions;
  taxCodes?: {
    default?: string;
    shipping?: string;
  };
};
