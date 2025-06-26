import themes from "daisyui/src/theming/themes";
import { ConfigProps, PricingPlan } from "./types/config";
import { StripePaymentMode } from "./libs/stripe";

const config: ConfigProps = {
  // REQUIRED
  appName: "HTS Hero",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription: "The Best Way to do HTS Classifications",
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
    importerPlans: [
      {
        // priceId: process.env.STRIPE_ONE_DAY_PASS_PRICE_ID || "",
        // promotionCode: process.env.STRIPE_HALF_OFF_PROMO_ID || "", // 50% off for launch
        name: PricingPlan.ONE_DAY_PASS,
        description: "Access Code Finder for 24 Hours",
        mode: StripePaymentMode.PAYMENT,
        price: 10,
        priceAnchor: 20,
        features: [
          {
            name: "Candidate Discovery",
          },
          {
            name: "Candidate Analysis & Suggestions",
          },
          {
            name: "Results in Seconds",
          },
          {
            name: "Full Classification Reports",
          },
        ],
      },
      {
        name: PricingPlan.FIVE_DAY_PASS,
        description: "Access Code Finder for 5 Days",
        mode: StripePaymentMode.PAYMENT,
        price: 25,
        priceAnchor: 50,
        isFeatured: true,
        features: [
          {
            name: "Candidate Discovery",
          },
          {
            name: "Candidate Analysis & Suggestions",
          },
          {
            name: "Results in Seconds",
          },
          {
            name: "Full Classification Reports",
          },
        ],
      },
      // {
      //   name: PricingPlan.IMPORTER,
      //   description: "Unlimited Access to Code Finder",
      //   mode: StripePaymentMode.SUBSCRIPTION,
      //   price: 20,
      //   priceAnchor: 40,
      //   features: [
      //     { name: "No cutoff date, ready to use whenever you need it" },
      //     {
      //       name: "Candidate Discovery",
      //     },
      //     {
      //       name: "Candidate Analysis & Suggestions",
      //     },
      //     {
      //       name: "Results in Seconds",
      //     },
      //     {
      //       name: "Full Classification Reports",
      //     },
      //   ],
      // },
    ],
    classifierPlans: [
      {
        name: PricingPlan.PRO,
        description: "The Classification Sidekick for Customs Brokers",
        mode: StripePaymentMode.SUBSCRIPTION,
        price: 20,
        priceAnchor: 40,
        isFeatured: true,
        features: [
          { name: "Heading Discovery" },
          { name: "Candidate Suggestions" },
          { name: "Report Generation" },
          { name: "Note Fetching" },
          {
            name: "Enhanced HTS Explorer",
          },
          {
            name: "Built-in PDF Viewer",
            details: "No downloads needed to find what you're looking for!",
          },
        ],
      },
      // {
      //   name: PricingPlan.PREMIUM,
      //   description: "Your Supercharged Classification Assistant",
      //   mode: StripePaymentMode.SUBSCRIPTION,
      //   price: 30,
      //   priceAnchor: 60,
      //   features: [
      //     { name: "Everything in Pro, Plus:" },
      //     {
      //       name: "Classification History",
      //       details: "For easy access, reference, & auditability",
      //       comingSoon: true,
      //     },
      //     {
      //       name: "Branded Reports",
      //       details: "Your branding & logo on every report",
      //       comingSoon: true,
      //     },
      //     {
      //       name: "Sharable Classifications",
      //       details:
      //         "Secure view-only links to classifications for clients & customs",
      //       comingSoon: true,
      //     },
      //     {
      //       name: "Tariff Finder",
      //       details: "Cut through the noise & nail your tariff calculations",
      //       comingSoon: true,
      //     },
      //   ],
      // },
    ],
    conversionPlans: [
      {
        name: PricingPlan.PRO,
        description: "Unlimited Access to Code Finder ",
        mode: StripePaymentMode.SUBSCRIPTION,
        price: 20,
        priceAnchor: 40,
        features: [
          { name: "Unlimited Classifications" },
          { name: "Heading Discovery" },
          {
            name: "Candidate Analysis & Suggestions",
            details: "Based on the GRI & Additional US Rules",
          },
          { name: "Fetches Relevant Notes" },
          {
            name: "Built-in PDF Viewer",
            details: "No downloads needed!",
          },
        ],
      },
      {
        name: PricingPlan.PREMIUM,
        description: "Code Finder + Report Generation",
        mode: StripePaymentMode.SUBSCRIPTION,
        price: 30,
        priceAnchor: 60,
        isFeatured: true,
        features: [
          { name: "Everything in Pro, Plus:" },
          {
            name: "Report Generation",
            details: "Get Ready-to-Share Classification Reports",
          },
          {
            name: "Classification History",
            comingSoon: true,
          },
          {
            name: "Tariff Assistant",
            roadmap: true,
          },
        ],
      },
      {
        name: PricingPlan.FIVE_DAY_PASS,
        description: "Access HTS Hero Premium for 5 Days",
        mode: StripePaymentMode.PAYMENT,
        price: 25,
        priceAnchor: 50,
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
      },
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
