import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    OrderService,
  } from "@medusajs/medusa"
import EmailNotificatorService from "src/services/email-notificator";
  
  export default async function handlePlaced({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const emailNotificator = container.resolve<EmailNotificatorService>("emailNotificatorService")
    emailNotificator.sendNotification(OrderService.Events.PLACED, data, null);
  }
  
  export const config: SubscriberConfig = {
    event: OrderService.Events.PLACED,
    context: {
      subscriberId: "order-placed-notificator-handler",
    },
  }