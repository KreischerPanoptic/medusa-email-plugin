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
  }
  
  export const config: SubscriberConfig = {
    event: 'invite.created',
    context: {
      subscriberId: "user-invite-created-notificator-handler",
    },
  }