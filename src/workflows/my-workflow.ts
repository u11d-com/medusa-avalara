import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import ClientService from "../modules/client-module/service";

const step1 = createStep("step-1", async (_, { container }) => {
  console.log(container.registrations);
  const client: ClientService = container.resolve("client_module");
  client.myFunc();
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
