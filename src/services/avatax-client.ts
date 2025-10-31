import AvaTaxClient from "avatax";
import { LogLevel } from "avatax/lib/utils/logger";
import { Logger } from "@medusajs/framework/types";
import { AvataxClientOptions } from "../types";
import { getPackageVersion } from "../utils";

export class AvataxClientFactory {
  private client: AvaTaxClient;
  private readonly pluginVersion: string;

  constructor(
    private readonly logger: Logger,
    private readonly options: AvataxClientOptions
  ) {
    this.pluginVersion = getPackageVersion(this.logger);
    this.initializeClient();
  }

  private initializeClient(): void {
    this.client = new AvaTaxClient({
      appName: "MedusaByU11D;a0oUz000009NbjFIAS",
      appVersion: this.pluginVersion,
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
      accountId: this.options.accountId.toString(),
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
