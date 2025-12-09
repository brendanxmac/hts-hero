import themes from "daisyui/src/theming/themes";
import { ConfigProps, PricingPlan, PricingPlanI } from "./types/config";
import { StripePaymentMode } from "./libs/stripe";

export const tariffImpactStarter: PricingPlanI = {
  name: "Starter",
  planIdentifier: PricingPlan.TARIFF_IMPACT_STARTER,
  description: "See if your imports are affected by tariffs",
  mode: StripePaymentMode.SUBSCRIPTION,
  prices: [0],
  features: [
    {
      name: "Unlimited Tariff Impact Checks",
      details: "See if your imports are affected by new tariff updates",
    },
    {
      name: "Product Catalog",
      details:
        "Upload your imports and quickly check them against new tariff announcements",
    },
  ],
};

export const tariffImpactStandard: PricingPlanI = {
  name: "Standard",
  planIdentifier: PricingPlan.TARIFF_IMPACT_STANDARD,
  description: "24/7 Tariff Monitoring for Your Imports",
  mode: StripePaymentMode.SUBSCRIPTION,
  prices: [19],
  priceAnchors: [40],
  features: [
    {
      name: "Unlimited Tariff Impact Checks",
      details: "See if your imports are affected by new tariff updates",
    },
    {
      name: "Product Catalog",
      details:
        "Upload your imports and quickly check them against new tariff announcements",
    },
    {
      name: "Tariff Monitoring for your Imports",
      details: "Get notified when your imports are affected by new tariffs",
    },
  ],
};

export const tariffImpactPro: PricingPlanI = {
  name: "Pro",
  planIdentifier: PricingPlan.TARIFF_IMPACT_PRO,
  description: "Master Tariffs & Find Ways to Save",
  mode: StripePaymentMode.SUBSCRIPTION,
  prices: [39],
  priceAnchors: [90],
  isFeatured: true,
  features: [
    {
      name: "Unlimited Tariff Impact Checks",
      details: "See if your imports are affected by new tariff announcements",
    },
    {
      name: "Product Catalog",
      details:
        "Upload your imports and quickly check them against tariff updates",
    },
    {
      name: "Tariff Monitoring for your Imports",
      details: "Get notified when your imports are affected by new tariffs",
    },
    {
      name: "Tariff Calculator",
      details:
        "See the tariffs, duty rates, & exemptions for any item from any country",
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

export const classifyPro: PricingPlanI = {
  name: "Pro",
  planIdentifier: PricingPlan.CLASSIFY_PRO,
  description: "The Smarter Way to Classify",
  mode: StripePaymentMode.SUBSCRIPTION,
  prices: [80],
  priceAnchors: [120],
  features: [
    { name: "Get Candidates for any Item" },
    { name: "GRI Analysis of all Candidates" },
    { name: "Discover Relevant CROSS Rulings" },
    { name: "See the Latest Tariffs for any Import" },
    { name: "Generate Client-Ready Advisory Reports" },
  ],
};

export const classifyTeam: PricingPlanI = {
  name: "Team",
  planIdentifier: PricingPlan.CLASSIFY_TEAM,
  description: "The Classification Workspace for Teams",
  mode: StripePaymentMode.SUBSCRIPTION,
  prices: [80, 70, 60],
  priceAnchors: [120, 120, 120],
  priceTiers: ["2-4 users", "5-9 users", "10+ users"],
  isFeatured: true,
  features: [
    { name: "Get Candidates for any Item" },
    { name: "GRI Analysis of all Candidates" },
    { name: "Discover Relevant CROSS Rulings" },
    { name: "See the Latest Tariffs for any Import" },
    { name: "Generate Client-Ready Advisory Reports" },
    { name: "See, Review, & Approve Your Team's Classifications" },
  ],
};

const config: ConfigProps = {
  // REQUIRED
  appName: "HTS Hero",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription: "Smarter Classifications, Effortless Tariffs",
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
    classifierPlans: [classifyPro, classifyTeam],
    classifierConversionPlans: [classifyPro, classifyTeam],
    tariffImpactPlans: [
      tariffImpactStarter,
      tariffImpactStandard,
      tariffImpactPro,
    ],
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
    fromAdmin: `HTS Hero <brendan@notify.htshero.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@htshero.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // theme: "dark",
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
