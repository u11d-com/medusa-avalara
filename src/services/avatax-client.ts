import AvaTaxClient from "avatax";
import { LogLevel } from "avatax/lib/utils/logger";
import { PingResultModel } from "avatax/lib/models/index";
import { Logger } from "@medusajs/framework/types";
import { AvataxClientOptions } from "../types";

export class AvataxClient {
  private client: AvaTaxClient;

  constructor(
    private readonly logger: Logger,
    private readonly options: AvataxClientOptions
  ) {
    this.initializeClient();
  }

  private initializeClient(): void {
    this.client = new AvaTaxClient({
      appName: this.options.appName || "MedusaAvaTaxPlugin",
      appVersion: this.options.appVersion || "1.0.0",
      machineName: this.options.machineName || "MedusaServer",
      environment: this.options.environment,
      timeout: 30_000,
      logOptions: {
        logEnabled: process.env.LOG_LEVEL === "debug",
        logLevel:
          process.env.LOG_LEVEL === "debug" ? LogLevel.Debug : LogLevel.Error,
        logRequestAndResponseInfo: process.env.LOG_LEVEL === "debug",
        logger: this.logger,
      },
      enableStrictTypeConversion: true,
    }).withSecurity({
      accountId: this.options.accountId,
      licenseKey: this.options.licenseKey,
    });

    this.logger.info(
      `AvaTax client initialized for ${this.options.environment} environment. Account ID: ${this.options.accountId}. Company Code: ${this.options.companyCode}`
    );
  }

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

    await this.validateCompanyCode();
    this.logger.info("AvaTax credentials validation completed successfully");
  }

  getClient(): AvaTaxClient {
    return this.client;
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

  private async validateCompanyCode(): Promise<boolean> {
    try {
      this.logger.debug(`Validating company code: ${this.options.companyCode}`);

      const response = await this.client.queryCompanies({
        filter: `companyCode eq '${this.options.companyCode}'`,
        top: 1,
      });

      if (!Array.isArray(response.value)) {
        throw new Error("Unexpected response format from AvaTax");
      }

      if (response.value.length === 0) {
        throw new Error(
          `Company code '${this.options.companyCode}' not found in AvaTax account`
        );
      }

      if (response.value.length > 1) {
        throw new Error(
          `Multiple companies found with code '${this.options.companyCode}'`
        );
      }

      const company = response.value[0];

      if (!company.isActive) {
        throw new Error(
          `Company '${this.options.companyCode}' exists but is not active`
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
