import { LoaderOptions } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  AvataxClientFactory,
  AvataxConnectionValidator,
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

  if (!(options && typeof options === "object")) {
    throw new Error("AvaTax options must be provided");
  }

  if (!AvataxOptionsValidator.validateOptions(options)) {
    throw new Error("AvaTax plugin options are invalid");
  }

  const client = new AvataxClientFactory(logger, options).getClient();
  const connectionValidator = new AvataxConnectionValidator(
    logger,
    client,
    options
  );
  await connectionValidator.validateConnection();

  container.register("avataxClient", asValue(client));
}
