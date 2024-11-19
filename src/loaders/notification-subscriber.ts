import { 
    MedusaContainer, 
    NotificationService,
  } from "@medusajs/medusa"
  
  export default async (
    container: MedusaContainer
  ): Promise<void> => {
    const notificationService = container.resolve<
      NotificationService
    >("notificationService")
    
    const emailEvents: string[] = [
        'order.placed',
        'order.cancelled',
        'order.completed',
        'order.payment_captured',
        'order.shipment_created',
        'order.refund_created',
        'customer.created',
        'customer.password_reset',
        'customer.email_confirm',
        'invite.created',
        'user.created',
        'user.password_reset'
    ];
}
