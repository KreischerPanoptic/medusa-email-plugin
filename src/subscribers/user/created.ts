import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    UserService,
  } from "@medusajs/medusa"
import EmailNotificatorService from "src/services/email-notificator";
  
  export default async function handleUserCreated({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const emailNotificator = container.resolve<EmailNotificatorService>("emailNotificatorService")
    emailNotificator.sendNotification(UserService.Events.CREATED, data, null);
  }
  
  export const config: SubscriberConfig = {
    event: UserService.Events.CREATED,
    context: {
      subscriberId: "user-created-notificator-handler",
    },
  }