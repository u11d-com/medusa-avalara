import { AddressInfo } from "avatax/models";
import { AvataxClientOptions } from "./avatax-client-options";

export type AvataxPluginOptions = {
  client: AvataxClientOptions;
  shipFromAddress: AddressInfo;
  taxCodes?: {
    default?: string;
    shipping?: string;
    throwErrorIfMissing?: boolean;
  };
};
