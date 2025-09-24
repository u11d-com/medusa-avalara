import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { DocumentType } from "avatax/lib/enums";
import {
  ItemTaxCalculationLine,
  ShippingTaxCalculationLine,
  TaxCalculationContext,
  Logger,
  OrderDTO,
  CustomerDTO,
} from "@medusajs/framework/types";
import { AVATAX_FACTORY_MODULE } from "../modules/avatax-factory";
import AvataxFactoryService from "../modules/avatax-factory/service";

type CreateAvalaraTransactionInput = {
  orderId: string;
};

type CreateAvalaraTransactionOutput = {
  transactionId?: string;
  success: boolean;
  message: string;
};

const fetchDataStep = createStep(
  "fetch-order",
  async (input: CreateAvalaraTransactionInput, { container }) => {
    const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    const orderService = container.resolve("order");
    const customerService = container.resolve("customer");

    logger.debug(`Fetching order with ID: ${input.orderId}`);
    const order = await orderService.retrieveOrder(input.orderId, {
      relations: [
        "items",
        "shipping_methods",
        "billing_address",
        "shipping_address",
      ],
    });
    logger.debug(`Order ${input.orderId} fetched`);

    if (!order.customer_id) {
      throw new Error(`Order ${order.id} does not have an associated customer`);
    }

    logger.debug(`Fetching customer with ID: ${order.customer_id}`);
    const customer = await customerService.retrieveCustomer(order.customer_id);
    logger.debug(`Customer ${customer.id} fetched`);

    return new StepResponse({ order, customer });
  }
);

const createAvalaraTransactionStep = createStep(
  "create-avalara-transaction",
  async (
    { customer, order }: { order: OrderDTO; customer: CustomerDTO },
    { container }
  ) => {
    const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    try {
      const factory: AvataxFactoryService = container.resolve(
        AVATAX_FACTORY_MODULE
      );
      const converter = factory.getConverter();

      logger.debug(`Creating Avalara transaction for order ${order.id}`);

      const itemLines: ItemTaxCalculationLine[] =
        order.items?.map((item) => ({
          line_item: {
            id: item.id,
            product_id: item.product_id || "",
            unit_price: item.unit_price,
            quantity: item.quantity,
            currency_code: order.currency_code,
          },
          rates: [],
        })) || [];

      const shippingLines: ShippingTaxCalculationLine[] =
        order.shipping_methods?.map((method) => ({
          shipping_line: {
            id: method.id,
            unit_price: method.amount || 0,
            shipping_option_id: method.shipping_option_id || "",
          },
          rates: [],
        })) || [];

      const context = converter.toTaxCalculationContext(order, customer);
      const transactionModel = await converter.toTransactionModel(
        itemLines,
        shippingLines,
        context,
        DocumentType.SalesInvoice
      );

      const client = factory.getClient();
      const response = await client.createTransaction({
        model: transactionModel,
      });

      logger.info(
        `Successfully created Avalara transaction ${response.code} for order ${order.id}`
      );

      const result: CreateAvalaraTransactionOutput = {
        transactionId: response.code,
        success: true,
        message: `Avalara transaction created successfully for order ${order.id}`,
      };

      return new StepResponse(result);
    } catch (error) {
      logger.error(
        `Failed to create Avalara transaction for order ${order.id}: ${error.message}`
      );

      const result: CreateAvalaraTransactionOutput = {
        success: false,
        message: `Failed to create Avalara transaction: ${error.message}`,
      };

      return new StepResponse(result);
    }
  }
);

const createAvalaraTransactionWorkflow = createWorkflow(
  "create-avalara-transaction",
  function (input: CreateAvalaraTransactionInput) {
    const data = fetchDataStep(input);
    // todo: skip if avalara is not used for this region
    const result = createAvalaraTransactionStep(data);

    return new WorkflowResponse(result);
  }
);

export default createAvalaraTransactionWorkflow;
