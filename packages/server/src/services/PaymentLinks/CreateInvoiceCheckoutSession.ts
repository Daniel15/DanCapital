import { Inject, Service } from 'typedi';
import { StripePaymentService } from '../StripePayment/StripePaymentService';
import HasTenancyService from '../Tenancy/TenancyService';
import { ISaleInvoice } from '@/interfaces';
import { StripeInvoiceCheckoutSessionPOJO } from '@/interfaces/StripePayment';
import { PaymentLink } from '@/system/models';
import { initializeTenantSettings } from '@/api/middleware/SettingsMiddleware';
import config from '@/config';
import { GeneratePaymentLinkTransformer } from '../Sales/Invoices/GeneratePaymentLinkTransformer';

@Service()
export class CreateInvoiceCheckoutSession {
  @Inject()
  private tenancy: HasTenancyService;

  @Inject()
  private stripePaymentService: StripePaymentService;

  /**
   * Creates a new Stripe checkout session from the given sale invoice.
   * @param {number} tenantId
   * @param {number} saleInvoiceId - Sale invoice id.
   * @returns {Promise<StripeInvoiceCheckoutSessionPOJO>}
   */
  async createInvoiceCheckoutSession(
    publicPaymentLinkId: string,
  ): Promise<StripeInvoiceCheckoutSessionPOJO> {
    // Retrieves the payment link from the given id.
    const paymentLink = await PaymentLink.query()
      .findOne('linkId', publicPaymentLinkId)
      .where('resourceType', 'SaleInvoice')
      .throwIfNotFound();

    const tenantId = paymentLink.tenantId;
    await initializeTenantSettings(tenantId);

    const { SaleInvoice } = this.tenancy.models(tenantId);
    // Retrieves the invoice from associated payment link.
    const invoice = await SaleInvoice.query()
      .findById(paymentLink.resourceId)
      .withGraphFetched('paymentMethods')
      .throwIfNotFound();

    // It will be only one Stripe payment method associated to the invoice.
    const stripePaymentMethod = invoice.paymentMethods?.find(
      (method) => method.paymentIntegration?.service === 'Stripe',
    );
    const stripeAccountId = stripePaymentMethod?.paymentIntegration?.accountId;

    // Creates checkout session for the given invoice.
    const session = await this.createCheckoutSession(
      invoice,
      stripeAccountId,
      paymentLink,
    );
    return {
      sessionId: session.id,
      publishableKey: config.stripePayment.publishableKey,
      redirectTo: session.url,
    };
  }

  /**
   * Creates a new Stripe checkout session for the given sale invoice.
   * @param {ISaleInvoice} invoice - The sale invoice for which the checkout session is created.
   * @param {string} stripeAccountId - The Stripe account ID associated with the payment method.
   * @returns {Promise<any>} - The created Stripe checkout session.
   */
  private createCheckoutSession(
    invoice: ISaleInvoice,
    stripeAccountId: string,
    paymentLink: PaymentLink,
  ) {
    const paymentLinkUrl = new GeneratePaymentLinkTransformer().link(
      paymentLink,
    );
    return this.stripePaymentService.stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: invoice.currencyCode,
              product_data: {
                name: invoice.invoiceNo,
              },
              unit_amount: invoice.total * 100, // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        // https://docs.stripe.com/payments/checkout/custom-success-page?payment-ui=stripe-hosted#modify-the-success-url
        success_url: `${paymentLinkUrl}/success/{CHECKOUT_SESSION_ID}`,
        cancel_url: paymentLinkUrl,
        metadata: {
          paymentLinkId: paymentLink.id,
          saleInvoiceId: invoice.id,
          resource: 'SaleInvoice',
          tenantId: paymentLink.tenantId,
        },
      },
      { stripeAccount: stripeAccountId },
    );
  }
}
