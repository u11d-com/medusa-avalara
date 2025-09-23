import { LoaderOptions } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { asValue } from "awilix";
import { AvataxClient, AvataxOptionsValidator } from "../../services";

export default async function validateAvataxConnectionLoader({
  options,
  container,
}: LoaderOptions<Record<string, unknown>>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  if (process.argv.includes("db:migrate")) {
    return logger.debug(
      "Skipping AvaTax connection validation during migration"
    );
  }

  if (!(options?.client && typeof options.client === "object")) {
    throw new Error("AvaTax client options must be provided");
  }

  if (!AvataxOptionsValidator.validateClientOptions(options.client)) {
    throw new Error("AvaTax client options are invalid");
  }

  const client = new AvataxClient(logger, options.client);

  // todo: move to workflow
  await client.validateConnection();
}
