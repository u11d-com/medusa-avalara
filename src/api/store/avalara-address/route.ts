import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AVATAX_FACTORY_MODULE } from "../../../modules/avatax-factory";
import { AvataxFactoryService } from "../../../modules/avatax-factory/service";
import { AddressValidationInfo } from "avatax/models";

export async function POST(
  req: MedusaRequest<AddressValidationInfo>,
  res: MedusaResponse
): Promise<void> {
  const avataxFactoryService: AvataxFactoryService = req.scope.resolve(
    AVATAX_FACTORY_MODULE
  );
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  const { line1, city, region, country } = req.body;

  logger.debug(
    `POST /store/avalara-address/validate - Validating address: ${JSON.stringify(
      req.body
    )}`
  );

  if (!line1 || !city || !country) {
    logger.error(
      "POST /store/avalara-address/validate - Missing required fields (line1, city, country)"
    );
    res.status(400).json({
      error: "Missing required fields",
      address: req.body,
      details:
        "The following fields are required: line1, city, and country. For US addresses, region is also required.",
    });
    return;
  }

  if (country.toLowerCase() === "us" && !region) {
    logger.error(
      "POST /store/avalara-address/validate - Missing region for US address"
    );
    res.status(400).json({
      address: req.body,
      error: "Missing required field",
      details: "For US addresses, the region (state) field is required.",
    });
    return;
  }

  try {
    const client = avataxFactoryService.getClient();

    logger.debug(
      "POST /store/avalara-address/validate - Calling AvaTax API for address validation"
    );

    const result = await client.resolveAddressPost({
      model: req.body,
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
