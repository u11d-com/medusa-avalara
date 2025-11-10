import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AVATAX_FACTORY_MODULE } from "../../../modules/avatax-factory";
import { AvataxFactoryService } from "../../../modules/avatax-factory/service";
import { z } from "zod";
import { PostAvalaraAddressSchema } from "./validators";

type PostAvalaraAddressType = z.infer<typeof PostAvalaraAddressSchema>;

export async function POST(
  req: MedusaRequest<PostAvalaraAddressType>,
  res: MedusaResponse
): Promise<void> {
  const avataxFactoryService: AvataxFactoryService = req.scope.resolve(
    AVATAX_FACTORY_MODULE
  );
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  const addressData = req.validatedBody;

  logger.debug(
    `POST /store/avalara-address/validate - Validating address: ${JSON.stringify(
      addressData
    )}`
  );

  try {
    const client = avataxFactoryService.getClient();

    logger.debug(
      "POST /store/avalara-address/validate - Calling AvaTax API for address validation"
    );

    const result = await client.resolveAddressPost({
      model: addressData,
    });

    logger.debug(
      `POST /store/avalara-address/validate - Address validation completed with resolution quality: ${result.resolutionQuality}`
    );

    res.json(result);
  } catch (error) {
    logger.error(
      `POST /store/avalara-address/validate - Address validation failed: ${error.message}`
    );

    res.status(500).json({
      error: "Address validation failed",
      details: error.message,
    });
  }
}
