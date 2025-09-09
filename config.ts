import themes from "daisyui/src/theming/themes";
import { ConfigProps, PricingPlan, PricingPlanI } from "./types/config";
import { StripePaymentMode } from "./libs/stripe";

export const tariffImpactStarter: PricingPlanI = {
  name: "Starter",
  planIdentifier: PricingPlan.TARIFF_IMPACT_STARTER,
  description: "A Few Tariff Checks",
  mode: StripePaymentMode.SUBSCRIPTION,
  price: 0,
  features: [
    {
      name: "20 Tariff Impact Checks / Month",
      details:
        "A check happens any time you submit a code to see if it's affected by a tariff update",
    },
  ],
};

export const tariffImpactStandard: PricingPlanI = {
  name: "Standard",
  planIdentifier: PricingPlan.TARIFF_IMPACT_STANDARD,
  description: "Tariff Essentials",
  mode: StripePaymentMode.SUBSCRIPTION,
  price: 39,
  priceAnchor: 70,
  features: [
    {
      name: "300 Tariff Impact Checks / Month",
      details:
        "A check happens any time you submit a code to see if it's affected by a tariff update",
    },
    { name: "Notifications when your imports are affected by new tariffs" },
    // {
    //   name: "Tariff Analyzer",
    //   details: "See full tariff details & explore exemptions",
    // },
  ],
};

export const tariffImpactPro: PricingPlanI = {
  name: "Pro",
  planIdentifier: PricingPlan.TARIFF_IMPACT_PRO,
  description: "Master Tariffs & Save Money",
  mode: StripePaymentMode.SUBSCRIPTION,
  price: 79,
  priceAnchor: 150,
  isFeatured: true,
  features: [
    {
      name: "Unlimited Tariff Impact Checks",
      details:
        "A check is any time you submit a code to see if it's affected by a tariff update and get the answer",
    },
    { name: "Notifications when your imports are affected by new tariffs" },
    {
      name: "Tariff Wizard",
      details:
        "Quickly calculate tariffs & discover potential savings for any import",
    },
    // { name: "Generate & share branded reports" }, // TODO: This could be great
  ],
};

// const classifyTrial: PricingPlanI = {
//   name: "Free Trial",
//   planIdentifier: PricingPlan.CLASSIFY_TRIAL,
//   description: "Try Classify Pro for 7 Days",
//   mode: StripePaymentMode.SUBSCRIPTION,
//   price: 0,
//   features: [{ name: "All features of Classify Pro, for 7 Days" }],
// };

const classifyPro: PricingPlanI = {
  name: "Pro",
  planIdentifier: PricingPlan.CLASSIFY_PRO,
  description: "The Classification Assistant for Customs Brokers",
  mode: StripePaymentMode.SUBSCRIPTION,
  price: 80,
  priceAnchor: 120,
  isFeatured: true,
  features: [
    { name: "Finds Headings" },
    { name: "Analyzes Candidates" },
    { name: "Calculates Tariffs" },
    { name: "Generates Reports" },
    { name: "Fetches Notes" },
    { name: "Finds CROSS Rulings" },
  ],
};

const config: ConfigProps = {
  // REQUIRED
  appName: "HTS Hero",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription: "The Intelligent Assistant Built for Customs Brokers",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "htshero.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "0c3dd164-9731-427e-ade8-1ca2d536f296",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    classifierPlans: [classifyPro],
    classifierConversionPlans: [classifyPro],
    tariffImpactPlans: [
      tariffImpactStarter,
      tariffImpactStandard,
      tariffImpactPro,
    ],
    tariffImpactConversionPlans: [tariffImpactStandard, tariffImpactPro],
  },
  // aws: {
  //   // If you use AWS S3/Cloudfront, put values in here
  //   bucket: "bucket-name",
  //   bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
  //   cdn: "https://cdn-id.cloudfront.net/",
  // },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `HTS Hero <noreply@notify.htshero.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Brendan at HTS Hero <brendan@notify.htshero.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@htshero.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "dark",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/",
  },
} as ConfigProps;

export default config;
