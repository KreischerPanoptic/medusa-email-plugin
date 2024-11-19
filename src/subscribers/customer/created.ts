import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    CustomerService,
  } from "@medusajs/medusa"
import EmailNotificatorService from "src/services/email-notificator";
  
  export default async function handleCustomerCreated({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const emailNotificator = container.resolve<EmailNotificatorService>("emailNotificatorService")
    emailNotificator.sendNotification(CustomerService.Events.CREATED, data, null);
  }
  
  export const config: SubscriberConfig = {
    event: CustomerService.Events.CREATED,
    context: {
      subscriberId: "customer-created-notificator-handler",
    },
  }