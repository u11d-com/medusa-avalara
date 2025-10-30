import AvaTaxClient from "avatax";
import { Logger } from "@medusajs/framework/types";
import { PingResultModel } from "avatax/lib/models/index";
import { AvataxClientOptions } from "../types";

export class AvataxConnectionValidator {
  constructor(
    private readonly logger: Logger,
    private readonly client: AvaTaxClient,
    private readonly options: AvataxClientOptions
  ) {}

  async validateConnection(): Promise<void> {
    this.logger.debug("Starting AvaTax connection validation...");
    const pingResponse = await this.ping();

    if (pingResponse.authenticated) {
      this.logger.info("AvaTax server connection validated successfully");
    } else {
      throw new Error(
        "AvaTax server connection successful but not authenticated. Please check your credentials (accountId and licenseKey)."
      );
    }

    await this.validateCompany();
    this.logger.info("AvaTax credentials validation completed successfully");
  }

  private async ping(): Promise<PingResultModel> {
    try {
      this.logger.debug("Pinging AvaTax server...");
      const response = await this.client.ping();

      return response;
    } catch (error) {
      this.logger.error("Failed to ping AvaTax server:", error);
      throw new Error(`AvaTax server ping failed: ${error.message}`);
    }
  }

  private async validateCompany(): Promise<boolean> {
    try {
      this.logger.debug(`Validating company ID: ${this.options.companyId}`);

      const company = await this.client.getCompany({
        id: this.options.companyId,
      });

      if (!company) {
        throw new Error(
          `Company with ID '${this.options.companyId}' does not exist`
        );
      }

      if (company.companyCode !== this.options.companyCode) {
        throw new Error(
          `Company code '${company.companyCode}' does not match the provided company code '${this.options.companyCode}'`
        );
      }

      if (company.accountId !== this.options.accountId) {
        throw new Error(
          `Company account ID '${company.accountId}' does not match the provided account ID '${this.options.accountId}'`
        );
      }

      if (!company.isActive) {
        throw new Error(
          `Company '${this.options.companyId}' exists but is not active`
        );
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Company code validation failed: ${JSON.stringify(error)}`
      );
      throw new Error(`Company code validation failed: ${error.message}`);
    }
  }
}
