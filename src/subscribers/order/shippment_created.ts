import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    OrderService,
  } from "@medusajs/medusa"
import EmailNotificatorService from "src/services/email-notificator";
  
  export default async function handleShippmentCreated({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const emailNotificator = container.resolve<EmailNotificatorService>("emailNotificatorService")
    emailNotificator.sendNotification(OrderService.Events.SHIPMENT_CREATED, data, null);
  }
  
  export const config: SubscriberConfig = {
    event: OrderService.Events.SHIPMENT_CREATED,
    context: {
      subscriberId: "order-shippment-created-notificator-handler",
    },
  }