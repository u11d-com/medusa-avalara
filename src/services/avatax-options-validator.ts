import { AvalaraPluginOptions } from "../types";

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

  static validateOptions(
    options: Record<string, unknown>
  ): options is AvalaraPluginOptions {
    if (!options || typeof options !== "object") {
      throw new Error("AvaTax plugin options must be provided as an object");
    }

    this.validateRequiredField("accountId", options, "number");
    this.validateRequiredField("licenseKey", options, "string");
    this.validateRequiredField("companyId", options, "number");
    this.validateRequiredField("companyCode", options, "string");
    this.validateRequiredField("environment", options, "string", [
      "sandbox",
      "production",
    ]);

    this.validateOptionalField("machineName", options);
    this.validateOptionalField("defaultTaxCode", options);
    this.validateOptionalField("shippingTaxCode", options);

    return true;
  }
}
