import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { AvataxClientFactoryService } from "../modules/avatax-client-factory/service";
import { AVATAX_CLIENT_FACTORY_MODULE } from "../modules/avatax-client-factory";

const step1 = createStep("step-1", async (_, { container }) => {
  console.log(container.registrations);
  const clientFactory: AvataxClientFactoryService = container.resolve(
    AVATAX_CLIENT_FACTORY_MODULE
  );
  const client = clientFactory.getClient();
  return new StepResponse(`Hello from step one!`);
});

type WorkflowInput = {
  name: string;
};

const step2 = createStep("step-2", async (x: WorkflowInput) => {
  return new StepResponse(`Hello ${x} from step two!`);
});

const myWorkflow = createWorkflow(
  "hello-world",
  function (input: WorkflowInput) {
    const str1 = step1();
    // to pass input
    const str2 = step2(input);

    return new WorkflowResponse({
      message: str2,
    });
  }
);

export default myWorkflow;
