import themes from "daisyui/src/theming/themes";
import { ConfigProps, PricingPlan, PricingType } from "./types/config";

const config = {
  // REQUIRED
  appName: "HTS Hero",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription: "Classify anything in seconds",
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
      // {
      //   priceId: process.env.NODE_ENV === "development" ? "1" : "2",
      //   name: PricingPlan.MANUAL_SINGLE,
      //   description: "A single classification from a manual classifier",
      //   type: PricingType.ONE_TIME,
      //   price: 150,
      //   priceAnchor: null,
      //   isCompetitor: true,
      //   features: [
      //     {
      //       name: "Usually takes over a day",
      //     },
      //     {
      //       name: "Might required lots of back and forth",
      //     },
      //     {
      //       name: "Might need to pay more in some cases...",
      //     },
      //   ],
      // },
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId: process.env.NODE_ENV === "development" ? "3" : "4",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: PricingPlan.ONE_DAY_PASS,
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Get your code, and get on with your day", // & based on the USITC
        // The type of pricing plan, either one time or subscription
        type: PricingType.ONE_TIME,
        // The price you want to display, the one user will be charged on Stripe.
        price: 25,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 40,
        features: [
          {
            name: "The HTS Hero Classification Assistant",
            details: "Type description, get code",
          },
          {
            name: "Downloadable classification reports",
          },
          {
            name: "Access for up to 1 day",
          },
        ],
      },
      {
        priceId: process.env.NODE_ENV === "development" ? "5" : "6",
        name: PricingPlan.FIVE_DAY_PASS,
        description: "Get your code, take your time",
        type: PricingType.ONE_TIME,
        price: 40,
        priceAnchor: 60,
        isFeatured: true,
        features: [
          {
            name: "The HTS Hero Classification Assistant",
            details: "Type description, get code",
          },
          {
            name: "Downloadable classification reports",
          },
          {
            name: "Access for up to 5 days",
          },
        ],
      },
      // {
      //   // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
      //   priceId: process.env.NODE_ENV === "development" ? "lol" : "haha",
      //   //  REQUIRED - Name of the plan, displayed on the pricing page
      //   name: PricingPlan.PRO,
      //   // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
      //   description: "Full access, as long as you want", // & based on the USITC
      //   type: PricingType.SUBSCRIPTION,
      //   // The price you want to display, the one user will be charged on Stripe.
      //   price: 30,
      //   // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
      //   priceAnchor: 45,
      //   features: [
      //     {
      //       name: "Get the full HTS Hero experience",
      //       details: "Including all of the classification features",
      //     },
      //     {
      //       name: "Download & keep your classification reports",
      //     },
      //     {
      //       name: "Unlimited access",
      //     },
      //   ],
      // },
    ],
    classifierPlans: [
      {
        priceId: process.env.NODE_ENV === "development" ? "7" : "8",
        name: PricingPlan.STANDARD,
        description:
          "Instantly Access to our intelligent classification system", // & based on the USITC
        type: PricingType.SUBSCRIPTION,
        price: 30,
        priceAnchor: 45,
        features: [
          { name: "Header Suggestions" },
          {
            name: "Best Match Suggestions",
            details: "For each classification level",
          },
          { name: "Classification Reports" },
          {
            name: "Selection Logic for Each Level",
            details: "Based on the GRI & Additional US Rules",
          },
        ],
      },
      {
        priceId: process.env.NODE_ENV === "development" ? "9" : "10",
        name: PricingPlan.PRO,
        description: "Download & keep classification reports forever", // & based on the USITC
        type: PricingType.SUBSCRIPTION,
        price: 40,
        priceAnchor: 60,
        isFeatured: true,
        features: [
          { name: "Header Suggestions" },
          {
            name: "Best Match Suggestions",
            details: "For each classification level",
          },
          { name: "Classification Reports" },
          {
            name: "Selection Logic for Each Level",
            details: "Based on the GRI & Additional US Rules",
          },
          { name: "Download & keep your classification reports" },
        ],
      },
      // {
      //   // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
      //   priceId:
      //     process.env.NODE_ENV === "development"
      //       ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
      //       : "price_456",
      //   //  REQUIRED - Name of the plan, displayed on the pricing page
      //   name: PricingPlan.Standard,
      //   // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
      //   description: "No more looking up notes, rulings, or references.",
      //   // The price you want to display, the one user will be charged on Stripe.
      //   price: 40,
      //   // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
      //   priceAnchor: null,
      //   features: [
      //     {
      //       name: "Everything in Starter",
      //     },
      //     {
      //       name: "Finds Related CROSS Rulings",
      //     },
      //     { name: "Finds Relevant Notes" },
      //     {
      //       name: "Finds HTS Element References",
      //       details:
      //         "Get the details of references like 'See Heading 9902.22.84' without searching for it",
      //     },
      //   ],
      // },
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
    fromNoReply: `HTS Hero <noreply@notify.htshero.com>`, // TODO: fix this using your email
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Brendan at HTS Hero <brendan@notify.htshero.com>`, // TODO: fix this using your email
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
    callbackUrl: "/explore",
  },
} as ConfigProps;

export default config;
