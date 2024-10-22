import { 
    type SubscriberConfig, 
    type SubscriberArgs,
  } from "@medusajs/medusa"
import EmailNotificatorService from "src/services/email-notificator";
  
  export default async function handleInvited({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const emailNotificator = container.resolve<EmailNotificatorService>("emailNotificatorService")
    emailNotificator.sendNotification('invite.created', data, null);
    // sendGridService.sendEmail({
    //   templateId: "customer-confirmation",
    //   from: "hello@medusajs.com",
    //   to: data.email,
    //   dynamic_template_data: {
    //     // any data necessary for your template...
    //     first_name: data.first_name,
    //     last_name: data.last_name,
    //   },
    // })
  }
  
  export const config: SubscriberConfig = {
    event: 'invite.created',
    context: {
      subscriberId: "customer-created-notificator-handler",
    },
  }