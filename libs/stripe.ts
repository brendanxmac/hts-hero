import Stripe from "stripe";

export enum StripePaymentMode {
  PAYMENT = "payment",
  SUBSCRIPTION = "subscription",
}

interface CreateCheckoutParams {
  priceId: string;
  mode: StripePaymentMode;
  successUrl: string;
  cancelUrl: string;
  promotionCode?: string | null;
  clientReferenceId?: string;
  user?: {
    customerId?: string;
    email?: string;
  };
}

interface CreateCustomerPortalParams {
  customerId: string;
  returnUrl: string;
  // Deep links into the portal (a plan change), tried in order; the portal's home when none works
  flows?: Stripe.BillingPortal.SessionCreateParams.FlowData[];
}

// This is used to create a Stripe Checkout for one-time payments. It's usually triggered with the <ButtonCheckout /> component. Webhooks are used to update the user's state in the database.
export const createCheckout = async ({
  user,
  mode,
  clientReferenceId,
  successUrl,
  cancelUrl,
  priceId,
  promotionCode,
}: CreateCheckoutParams): Promise<string> => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-09-30.endive",
      typescript: true,
    });

    const extraParams: {
      customer?: string;
      customer_creation?: "always";
      customer_email?: string;
      invoice_creation?: { enabled: boolean };
      payment_intent_data?: { setup_future_usage: "on_session" };
      tax_id_collection?: { enabled: boolean };
    } = {};

    if (user?.customerId) {
      extraParams.customer = user.customerId;
    } else {
      if (mode === StripePaymentMode.PAYMENT) {
        extraParams.customer_creation = "always";
        // The option below costs 0.4% (up to $2) per invoice. Alternatively, you can use https://zenvoice.io/ to create unlimited invoices automatically.
        // extraParams.invoice_creation = { enabled: true };
        extraParams.payment_intent_data = { setup_future_usage: "on_session" };
      }
      if (user?.email) {
        extraParams.customer_email = user.email;
      }
      extraParams.tax_id_collection = { enabled: true };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode,
      // allow_promotion_codes: true,
      client_reference_id: clientReferenceId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      discounts: promotionCode
        ? [
            {
              promotion_code: promotionCode,
            },
          ]
        : [],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...extraParams,
    });

    return stripeSession.url;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// This is used to create Customer Portal sessions, so users can manage their subscriptions (payment methods, cancel, etc..)
// The billing portal's settings for one product line: the active configuration whose
// metadata.app matches (the Tariff Tracker's lists only its own tiers to switch between). Without
// one, Stripe's default configuration is used.
const portalConfigurations = new Map<string, string | null>();

const portalConfigurationFor = async (stripe: Stripe, app: string) => {
  if (portalConfigurations.has(app)) return portalConfigurations.get(app);
  const { data } = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  const id = data.find((c) => c.metadata?.app === app)?.id ?? null;
  portalConfigurations.set(app, id);
  return id;
};

export const createCustomerPortal = async ({
  customerId,
  returnUrl,
  app,
  flows = [],
}: CreateCustomerPortalParams & { app?: string }): Promise<string> => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-09-30.endive",
    typescript: true,
  });

  const configuration = app ? await portalConfigurationFor(stripe, app) : null;
  const params = { customer: customerId, return_url: returnUrl, ...(configuration ? { configuration } : {}) };
  // Stripe refuses a flow the portal's configuration doesn't allow (a price it doesn't list)
  for (const flow_data of flows) {
    try {
      return (await stripe.billingPortal.sessions.create({ ...params, flow_data })).url;
    } catch (e) {
      console.error(`Billing portal ${flow_data.type} flow refused, trying the next:`, (e as Error).message);
    }
  }
  return (await stripe.billingPortal.sessions.create(params)).url;
};

// This is used to get the uesr checkout session and populate the data so we get the planId the user subscribed to
export const findCheckoutSession = async (sessionId: string) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-09-30.endive",
      typescript: true,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    return session;
  } catch (e) {
    console.error(e);
    return null;
  }
};
