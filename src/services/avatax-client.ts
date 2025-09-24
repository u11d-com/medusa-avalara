import AvaTaxClient from "avatax";
import { LogLevel } from "avatax/lib/utils/logger";
import { Logger } from "@medusajs/framework/types";
import { AvataxClientOptions } from "../types";

export class AvataxClientFactory {
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

  getClient(): AvaTaxClient {
    return this.client;
  }
}
