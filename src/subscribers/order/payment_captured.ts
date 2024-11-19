import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    OrderService,
  } from "@medusajs/medusa"
import EmailNotificatorService from "src/services/email-notificator";
  
  export default async function handlePaymentCaptured({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const emailNotificator = container.resolve<EmailNotificatorService>("emailNotificatorService")
    emailNotificator.sendNotification(OrderService.Events.PAYMENT_CAPTURED, data, null);
  }
  
  export const config: SubscriberConfig = {
    event: OrderService.Events.PAYMENT_CAPTURED,
    context: {
      subscriberId: "order-payment-captured-notificator-handler",
    },
  }