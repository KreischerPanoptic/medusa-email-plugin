import { Logger } from "@medusajs/types";
import {
    UserService,
    CustomerService,
    OrderService,
    AbstractNotificationService,
    Customer,
    User
} from '@medusajs/medusa'
import nodemailer from "nodemailer";
import EmailTemplates from "email-templates";

interface EmailConfig {
    templateDir: string;
    fromAddress: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
}

class UserData {
    id: string;
    email: string;
    user?: User | null;
    data?: any;
}

class CustomerData {
    customer?: Customer | null;
    data?: any;
}

class InviteData {
    id: string;
    token: string;
    email: string;
}

class EmailNotificatorService extends AbstractNotificationService  {
    static identifier = 'emailnotif';

    protected customerService: CustomerService;
    protected userService: UserService;
    protected orderService: OrderService;
    protected cartService: any;
    protected lineItemService: any;
    protected logger: Logger;
    protected emailConfig: EmailConfig;

    constructor(container: any, options: EmailConfig) {
        super(container);

        this.logger = container.logger;
        this.logger.info("✔ Email service initialized");
        this.customerService = container.customerService;
        this.userService = container.userService;
        this.orderService = container.orderService;
        this.cartService = container.cartService;
        this.lineItemService = container.lineItemService;
        this.emailConfig = options;
        if (!this.emailConfig.templateDir) {
            this.emailConfig.templateDir = "node_modules/medusa-email-plugin-extended/data/emails";
        }
        this.logger.info(`Email templates loaded from ${this.emailConfig.templateDir}`);
    }

      async userCreatedData(data: any): Promise<UserData> {
        const user = await this.userService.retrieve(data.id);
        if(user) {
            return {
                id: user.id,
                email: user.email,
                user,
                data
            }
        }
        return {id: data.id, email: this.emailConfig.smtpUser, user: null, data}
      }

      async userPasswordResetData(data: any): Promise<UserData> {
        const user = await this.userService.retrieveByEmail(data.email);
        if(user) {
            return {
                id: user.id,
                email: user.email,
                user,
                data
            }
        }
        return {id: '', email: data.email, user: null, data}
      }
      
      async customerCreatedData(data: Customer): Promise<CustomerData> {
        return {customer: data, data: null}
      }

      async customerPasswordResetData(data: any): Promise<CustomerData> {
        const customer = await this.customerService.retrieve(data.id);
        if(customer) {
            return {
                customer,
                data
            }
        }
        return {customer: null, data}
      }

      async customerConfirmEmailData(data: any): Promise<CustomerData> {
        const customer = await this.customerService.retrieve(data.id);
        if(customer) {
            return {
                customer,
                data
            }
        }
        return {customer: null, data}
      }
    
      inviteData(data: any): InviteData {
        return {
            id: data.id,
            token: data.token,
            email: data.user_email
        }
      }

    async sendNotification(
        event: string,
        data: any,
        attachmentGenerator: unknown
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, any>;
    }> {
        this.logger.info(`Sending notification '${event}' via email service`);
        if (event.includes("order.")) {
            // retrieve order
            // @ts-ignore
            const order = await this.orderService.retrieve(data.id || '', {
                relations: [
                    "refunds",
                    "items",
                    "customer",
                    "billing_address",
                    "shipping_address",
                    "discounts",
                    "discounts.rule",
                    "shipping_methods",
                    "shipping_methods.shipping_option",
                    "payments",
                    "fulfillments",
                    "fulfillments.tracking_links",
                    "returns",
                    "gift_cards",
                    "gift_card_transactions",
                ]
            });
            this.logger.info(`Order: ${JSON.stringify(order)}`);

            let totalValue = (order.items.reduce((value, item) => {
                return value + item.unit_price * item.quantity;
            }, 0))
            for (const option of order.shipping_methods) {
                totalValue += option.shipping_option.amount;
            }

            const paymentType = order.payments.some((p) => {return p.provider_id !== 'manual'}) ? 'banking' : 'manual';
            if(paymentType === 'banking' && event.includes("order.placed")) {
                return {
                    to: null,
                    data: {},
                    status: "sent",
                };
            }

            await this.sendEmail(order.email, event, {
                event,
                order,
                cart: await this.cartService.retrieve(order.cart_id || ''),
                id: data.id,
                total_value: (totalValue / 100).toFixed(2),
            })

            return {
                to: order.email,
                data: data,
                status: "sent",
            };
        }
        else if(event.includes("customer.")) {
            // retrieve customer
            let customer: CustomerData;
            if(event.includes('.created')) {
                customer = await this.customerCreatedData(data);
            }
            else if(event.includes('.password')) {
                customer = await this.customerPasswordResetData(data);
            }
            else if(event.includes('.email_confirm')) {
                customer = await this.customerConfirmEmailData(data);
            }

            if(customer) {
                this.logger.info(`Customer: ${JSON.stringify(customer)}`);
                
                await this.sendEmail(customer.customer.email, event, {
                    event,
                    customer,
                    id: customer.customer.id
                })

                return {
                    to: customer.customer.email,
                    data: data,
                    status: "sent",
                };
            }
        }
        else if(event.includes("invite.")) {
            // retrieve invite
            let invite: InviteData = this.inviteData(data);

            if(invite) {
                this.logger.info(`Invite: ${JSON.stringify(invite)}`);
                
                await this.sendEmail(invite.email, event, {
                    event,
                    invite,
                    token: invite.token,
                    id: invite.id
                })

                return {
                    to: invite.email,
                    data: data,
                    status: "sent",
                };
            }
        }
        else if(event.includes("user.")) {
            // retrieve user
            let user: UserData;
            if(event.includes('.created')) {
                user = await this.userCreatedData(data);
            }
            else if(event.includes('.password')) {
                user = await this.userPasswordResetData(data);
            }

            if(user) {
                this.logger.info(`User: ${JSON.stringify(user)}`);
                
                await this.sendEmail(user.email, event, {
                    event,
                    user,
                })

                return {
                    to: user.email,
                    data: data,
                    status: "sent",
                };
            }
        }

        return {
            to: null,
            data: {},
            status: "sent",
        };
    }

    async resendNotification(
        notification: unknown,
        config: unknown,
        attachmentGenerator: unknown
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, unknown>;
    }> {
        await this.sendEmail('arnis@test.com', 'sample', {
            event: notification,
        })

        return {
            to: 'arnis@arnis.lv',
            data: {},
            status: "sent",
        };
    }

    async sendEmail(toAddress: string, templateName: string, data: any) {
        // console.log('data', data)
        this.logger.info(JSON.stringify(data));
        const transport = nodemailer.createTransport({
            host: this.emailConfig.smtpHost,
            port: this.emailConfig.smtpPort,
            auth: {
                user: this.emailConfig.smtpUser,
                pass: this.emailConfig.smtpPassword,
            }
        });
        this.logger.info(`Sending email to '${toAddress}' using template '${templateName}'`);
        const email = new EmailTemplates({
            message: {
                from: this.emailConfig.fromAddress,
            },
            transport: transport,
            views: {
                root: this.emailConfig.templateDir,
                options: {
                    extensions: 'pug',
                },
            },
            send: true,
        });
        await email.send({
            template: templateName,
            message: {
                to: toAddress,
            },
            locals: {
                ...data,
            },
        });
    }
}

export default EmailNotificatorService;