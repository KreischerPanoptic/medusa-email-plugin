import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    UserService,
  } from "@medusajs/medusa"
import EmailNotificatorService from "src/services/email-notificator";
  
  export default async function handleUserResetPassword({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    const emailNotificator = container.resolve<EmailNotificatorService>("emailNotificatorService")
    emailNotificator.sendNotification(UserService.Events.PASSWORD_RESET, data, null);
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
    event: UserService.Events.PASSWORD_RESET,
    context: {
      subscriberId: "user-reset-password-notificator-handler",
    },
  }