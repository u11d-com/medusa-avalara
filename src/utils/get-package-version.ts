import { Logger } from "@medusajs/framework/types";

const npmPackagePath = "../../package.json";
const localLinkPackagePath = "../../../../package.json";

export const getPackageVersion = (logger: Logger): string => {
  let version: string = "";

  logger.debug("Loading package version...");
  [npmPackagePath, localLinkPackagePath].forEach((path) => {
    try {
      const packageJson = require(path);
      version = packageJson.version;
    } catch (error) {}
  });

  if (version) {
    logger.debug(`Avalara plugin package version found: ${version}`);
    return version;
  } else {
    logger.warn("Avalara plugin package version not found in any known paths");
    return "0.0.0";
  }
};
