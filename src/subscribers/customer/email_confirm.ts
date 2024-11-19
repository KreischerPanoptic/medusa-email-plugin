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
    emailNotificator.sendNotification('customer.email_confirm', data, null);
  }
  
  export const config: SubscriberConfig = {
    event: 'customer.email_confirm',
    context: {
      subscriberId: "customer-email-confirmation-requested-notificator-handler",
    },
  }