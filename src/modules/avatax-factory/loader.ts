import { LoaderOptions } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  AvataxClientFactory,
  AvataxConnectionValidator,
  AvataxConverter,
  AvataxOptionsValidator,
} from "../../services";
import { asValue } from "awilix";

export default async function avataxFactoryLoader({
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

  if (!AvataxOptionsValidator.validateOptions(options)) {
    throw new Error("AvaTax plugin options are invalid");
  }

  const client = new AvataxClientFactory(logger, options.client).getClient();
  const connectionValidator = new AvataxConnectionValidator(
    logger,
    client,
    options.client
  );
  await connectionValidator.validateConnection();

  container.register("avataxClient", asValue(client));
}
