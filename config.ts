import themes from "daisyui/src/theming/themes";
import { ConfigProps, PricingPlan, PricingPlanI } from "./types/config";
import { StripePaymentMode } from "./libs/stripe";

const proPlan: PricingPlanI = {
  name: PricingPlan.PRO,
  description: "The Classification Assistant for Customs Brokers",
  mode: StripePaymentMode.SUBSCRIPTION,
  price: 40,
  priceAnchor: 80,
  isFeatured: true,
  features: [
    { name: "Finds Headings" },
    { name: "Analyzes Candidates" },
    { name: "Generates Reports" },
    { name: "Fetches Notes" },
    {
      name: "Finds CROSS Rulings",
    },
    {
      name: "Enhanced HTS Explorer",
    },
  ],
};

const premiumPlan: PricingPlanI = {
  name: PricingPlan.PREMIUM,
  description: "Your Supercharged Classification Assistant",
  mode: StripePaymentMode.SUBSCRIPTION,
  price: 30,
  priceAnchor: 60,
  features: [
    { name: "Everything in Pro, Plus:" },
    {
      name: "Classification History",
      details: "For easy access, reference, & auditability",
      comingSoon: true,
    },
    {
      name: "Branded Reports",
      details: "Your branding & logo on every report",
      comingSoon: true,
    },
    {
      name: "Sharable Classifications",
      details:
        "Secure view-only links to classifications for clients & customs",
      comingSoon: true,
    },
    {
      name: "Tariff Finder",
      details: "Cut through the noise & nail your tariff calculations",
      comingSoon: true,
    },
  ],
};

const freeTrial: PricingPlanI = {
  name: PricingPlan.FREE_TRIAL,
  description: "Try HTS Hero Pro free for 7 days",
  mode: StripePaymentMode.PAYMENT,
  price: 0,
  priceAnchor: 40,
  features: [
    { name: "Finds Headings" },
    { name: "Analyzes Candidates" },
    { name: "Generates Reports" },
    { name: "Fetches Notes" },
    {
      name: "Finds CROSS Rulings",
    },
    {
      name: "Enhanced HTS Explorer",
    },
    {
      name: "Built-in PDF Viewer",
    },
  ],
};

const fiveDayPassPlan: PricingPlanI = {
  name: PricingPlan.FIVE_DAY_PASS,
  description: "Try HTS Hero Pro for 5 Days",
  mode: StripePaymentMode.PAYMENT,
  price: 20,
  priceAnchor: 40,
  features: [
    {
      name: "Includes everything in Pro",
    },
    {
      name: "One-Time Payment",
    },
    {
      name: "Unlimited Access for 5 Days",
    },
  ],
};

const config: ConfigProps = {
  // REQUIRED
  appName: "HTS Hero",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription: "The HTS Assistant Built for Customs Brokers",
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
    classifierPlans: [proPlan],
    conversionPlans: [proPlan],
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
    callbackUrl: "/app",
  },
} as ConfigProps;

export default config;
