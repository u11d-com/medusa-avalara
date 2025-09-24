import { WorkflowResult } from "@medusajs/framework/workflows-sdk";
import { Logger } from "@medusajs/medusa";

export const logWorkflowResult = (
  workflowId: string,
  { result, errors }: WorkflowResult,
  logger: Logger
) => {
  if (result && !errors.length) {
    logger.info(`Successfully completed workflow: ${workflowId}`);
  } else {
    logger.error(`Failed to complete workflow: ${workflowId}`);

    errors.forEach((error) => {
      logger.error(
        `Workflow error ${error.action} (${error.handlerType}): ${
          error.error?.message || error.error
        }`
      );
    });
  }
};
