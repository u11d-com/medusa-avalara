import { AvataxClientOptions, AvalaraPluginOptions } from "../types";

export class AvataxOptionsValidator {
  private static validateRequiredField(
    name: string,
    value: object,
    valueType: "string" | "number",
    allowedValues?: string[]
  ): void {
    if (!(name in value)) {
      throw new Error(`AvaTax ${name} is required`);
    }

    if (typeof value[name] !== valueType) {
      throw new Error(`AvaTax ${name} must be a ${valueType}`);
    }

    if (valueType === "string" && value[name]!.trim() === "") {
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

    this.validateRequiredField("accountId", clientOptions, "number");
    this.validateRequiredField("licenseKey", clientOptions, "string");
    this.validateRequiredField("companyId", clientOptions, "number");
    this.validateRequiredField("companyCode", clientOptions, "string");
    this.validateRequiredField("environment", clientOptions, "string", [
      "sandbox",
      "production",
    ]);

    this.validateOptionalField("machineName", clientOptions);

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

    this.validateClientOptions(options.client);

    if (options.taxCodes !== undefined) {
      if (typeof options.taxCodes !== "object") {
        throw new Error("AvaTax taxCodes must be an object if provided");
      }
      this.validateTaxCodes(options.taxCodes);
    }

    return true;
  }
}
