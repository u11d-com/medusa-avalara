import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { DocumentType, VoidReasonCode } from "avatax/lib/enums";
import { Logger } from "@medusajs/framework/types";
import { AVATAX_FACTORY_MODULE } from "../modules/avatax-factory";
import AvataxFactoryService from "../modules/avatax-factory/service";

const voidAvalaraTransactionStep = createStep(
  "void-avalara-transaction",
  async (orderId: string, { container }) => {
    const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    try {
      const factory: AvataxFactoryService = container.resolve(
        AVATAX_FACTORY_MODULE
      );

      logger.debug(`Committing Avalara transaction for order ${orderId}`);

      const client = factory.getClient();
      await client.voidTransaction({
        companyCode: factory.getCompanyCode(),
        model: {
          code: VoidReasonCode.Unspecified,
        },
        transactionCode: orderId,
        documentType: DocumentType.SalesInvoice,
      });

      logger.info(
        `Successfully voided Avalara transaction for order ${orderId}`
      );

      return new StepResponse(true);
    } catch (error) {
      logger.error(
        `Failed to void Avalara transaction for order ${orderId}: ${error.message}`
      );

      return new StepResponse(false);
    }
  }
);

const voidAvalaraTransactionWorkflow = createWorkflow(
  "void-avalara-transaction",
  function (orderId: string) {
    // todo: skip if avalara is not used for this region
    const result = voidAvalaraTransactionStep(orderId);

    return new WorkflowResponse(result);
  }
);

export default voidAvalaraTransactionWorkflow;
