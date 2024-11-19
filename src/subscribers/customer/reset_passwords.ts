import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    CustomerService,
  } from "@medusajs/medusa"
import EmailNotificatorService from "src/services/email-notificator";
  
  export default async function handleCustomerResetPassword({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const emailNotificator = container.resolve<EmailNotificatorService>("emailNotificatorService")
    emailNotificator.sendNotification(CustomerService.Events.PASSWORD_RESET, data, null);
  }
  
  export const config: SubscriberConfig = {
    event: CustomerService.Events.PASSWORD_RESET,
    context: {
      subscriberId: "customer-reset-password-notificator-handler",
    },
  }