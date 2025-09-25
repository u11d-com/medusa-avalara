import { AddressInfo } from "avatax/lib/models";
import { AvataxClientOptions, AvalaraPluginOptions } from "../types";

export class AvataxOptionsValidator {
  private static validateRequiredField(
    name: string,
    value: object,
    allowedValues?: string[]
  ): void {
    if (!(name in value)) {
      throw new Error(`AvaTax ${name} is required`);
    }

    if (typeof value[name] !== "string") {
      throw new Error(`AvaTax ${name} must be a string`);
    }

    if (value[name]!.trim() === "") {
      throw new Error(`AvaTax ${name} must be a non-empty string`);
    }

    if (allowedValues && !allowedValues.includes(value[name] as string)) {
      throw new Error(
        `Invalid AvaTax ${name}: ${
          value[name]
        }. Must be one of: ${allowedValues.join(", ")}`
      );
    }
  }

  private static validateOptionalField(name: string, value: object): void {
    if (!(name in value)) {
      return;
    }

    if (typeof value[name] !== "string") {
      throw new Error(`AvaTax ${name} must be a string if provided`);
    }

    if (value[name]!.trim() === "") {
      throw new Error(`AvaTax ${name} must be a non-empty string if provided`);
    }
  }

  static validateClientOptions(
    clientOptions: unknown
  ): clientOptions is AvataxClientOptions {
    if (typeof clientOptions !== "object" || clientOptions === null) {
      throw new Error("AvaTax client options must be provided as an object");
    }

    this.validateRequiredField("accountId", clientOptions);
    this.validateRequiredField("licenseKey", clientOptions);
    this.validateRequiredField("companyCode", clientOptions);
    this.validateRequiredField("environment", clientOptions, [
      "sandbox",
      "production",
    ]);

    this.validateOptionalField("appName", clientOptions);
    this.validateOptionalField("appVersion", clientOptions);
    this.validateOptionalField("machineName", clientOptions);

    return true;
  }

  static validateShipFromAddress(
    shipFromAddress: AddressInfo
  ): shipFromAddress is AddressInfo {
    if (!shipFromAddress || typeof shipFromAddress !== "object") {
      throw new Error("AvaTax shipFromAddress must be provided as an object");
    }

    const requiredFields = ["line1", "city", "region", "country", "postalCode"];
    const missingFields = requiredFields.filter((field) => {
      const value = shipFromAddress[field as keyof AddressInfo];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required AvaTax shipFromAddress fields: ${missingFields.join(
          ", "
        )}`
      );
    }

    if (shipFromAddress.country?.length !== 2) {
      throw new Error(
        "AvaTax shipFromAddress.country must be a 2-letter ISO country code"
      );
    }

    return true;
  }

  static validateTaxCodes(
    taxCodes?: object | null
  ): taxCodes is AvalaraPluginOptions["taxCodes"] {
    if (taxCodes === undefined) {
      return true; // Tax codes are optional
    }

    if (typeof taxCodes !== "object" || taxCodes === null) {
      throw new Error("AvaTax taxCodes must be an object if provided");
    }

    if ("default" in taxCodes) {
      if (
        typeof taxCodes.default !== "string" ||
        taxCodes.default.trim() === ""
      ) {
        throw new Error(
          "AvaTax taxCodes.default must be a non-empty string if provided"
        );
      }
    }

    if ("shipping" in taxCodes) {
      if (
        typeof taxCodes.shipping !== "string" ||
        taxCodes.shipping.trim() === ""
      ) {
        throw new Error(
          "AvaTax taxCodes.shipping must be a non-empty string if provided"
        );
      }
    }

    return true;
  }

  static validateOptions(
    options: Record<string, unknown>
  ): options is AvalaraPluginOptions {
    if (!options || typeof options !== "object") {
      throw new Error("AvaTax plugin options must be provided as an object");
    }

    if (!options.client) {
      throw new Error("AvaTax client configuration is required");
    }

    if (!options.shipFromAddress) {
      throw new Error("AvaTax shipFromAddress configuration is required");
    }

    this.validateClientOptions(options.client);
    this.validateShipFromAddress(options.shipFromAddress);

    if (options.taxCodes !== undefined) {
      if (typeof options.taxCodes !== "object") {
        throw new Error("AvaTax taxCodes must be an object if provided");
      }
      this.validateTaxCodes(options.taxCodes);
    }

    return true;
  }
}
