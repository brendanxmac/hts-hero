import themes from "daisyui/src/theming/themes";
import { ConfigProps, DaisyTheme } from "./types/config";

const config = {
  // REQUIRED
  appName: "HTS Hero",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "The HTS code finder that helps you import with less worry & surprises to your bottom line.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "htshero.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "0c3dd164-9731-427e-ade8-1ca2d536f296",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    // onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId: process.env.NODE_ENV === "development" ? "lol" : "haha",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Starter",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description:
          "Get access to the enhanced HTS navigation tool designed for experts", // & based on the USITC
        // The price you want to display, the one user will be charged on Stripe.
        price: 0,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 50,
        features: [
          { name: "Easily go from section to 10 digits" },
          {
            name: "Click to explore, No PDF's required",
          },
          {
            name: "Jump to referenced elements with a single click",
          },
          {
            name: "Solves the USITC website issues",
          },
          { name: "Free forever for early adopters" },
        ],
      },
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
            : "price_456",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Standard",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "No more looking up notes, rulings, or references.",
        // The price you want to display, the one user will be charged on Stripe.
        price: 40,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 70,
        features: [
          {
            name: "Everything in Starter",
          },
          {
            name: "Fetches Related CROSS Rulings",
          },
          { name: "Fetches Relevant Notes" },
          {
            name: "Fetches HTS Element References",
            details:
              "See details of 'See Heading 9902.22.84' without searching for it",
          },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp7iftKnrrpw"
            : "price_456",
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: "Pro",
        // Your Personal Classification Assistant
        // Autocomplete for Classifiers
        description: "Your Personal Classification Assistant",
        price: 60,
        priceAnchor: 100,
        features: [
          {
            name: "Everything in Standard",
          },
          { name: "Product Analysis" },
          { name: "Automatic Classifications" },
          { name: "GRI Reasoning for Each Choice" },
          { name: "Best Match Suggestions" },
          { name: "Report Generation" },
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
    fromNoReply: `HTS Hero <noreply@notify.htshero.com>`, // TODO: fix this using your email
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Brendan at HTS Hero <brendn@notify.htshero.com>`, // TODO: fix this using your email
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@htshero.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: DaisyTheme.BLACK,
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["black"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/app",
  },
} as ConfigProps;

export default config;
