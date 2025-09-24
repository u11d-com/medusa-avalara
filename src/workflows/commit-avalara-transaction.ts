import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { DocumentType } from "avatax/lib/enums";
import { Logger } from "@medusajs/framework/types";
import { AVATAX_FACTORY_MODULE } from "../modules/avatax-factory";
import AvataxFactoryService from "../modules/avatax-factory/service";

const commitAvalaraTransactionStep = createStep(
  "commit-avalara-transaction",
  async (orderId: string, { container }) => {
    const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    try {
      const factory: AvataxFactoryService = container.resolve(
        AVATAX_FACTORY_MODULE
      );

      logger.debug(`Committing Avalara transaction for order ${orderId}`);

      const client = factory.getClient();
      await client.commitTransaction({
        companyCode: factory.getCompanyCode(),
        model: {
          commit: true,
        },
        transactionCode: orderId,
        documentType: DocumentType.SalesInvoice,
      });

      logger.info(
        `Successfully committed Avalara transaction for order ${orderId}`
      );

      return new StepResponse(true);
    } catch (error) {
      logger.error(
        `Failed to commit Avalara transaction for order ${orderId}: ${error.message}`
      );

      return new StepResponse(false);
    }
  }
);

const commitAvalaraTransactionWorkflow = createWorkflow(
  "commit-avalara-transaction",
  function (orderId: string) {
    // todo: skip if avalara is not used for this region
    const result = commitAvalaraTransactionStep(orderId);

    return new WorkflowResponse(result);
  }
);

export default commitAvalaraTransactionWorkflow;
