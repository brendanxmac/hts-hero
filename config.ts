import themes from "daisyui/src/theming/themes";
import { ConfigProps, PricingPlan, PricingType } from "./types/config";

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
        description: "Unlimited Access to Code Finder for 24 Hours",
        type: PricingType.ONE_TIME,
        price: 10,
        priceAnchor: 20,
        features: [
          {
            name: "Finds the Best Candidates for your Product",
          },
          {
            name: "Suggests the Best Option",
          },
          {
            name: "Gets Results in Seconds",
          },
          {
            name: "Generates Full Classification Reports",
          },
          // {
          //   name: "Code Finder",
          //   details: "Unlimited Use of our Classification Assistant",
          // },
          // {
          //   name: "Classification Reports",
          //   // details:
          //   //   "In case customs asks questions or suppliers pull a fast one",
          // },
          // {
          //   name: "Access for 1 day",
          // },
        ],
      },
      {
        name: PricingPlan.FIVE_DAY_PASS,
        description: "Unlimited Access to Code Finder for 5 Days",
        type: PricingType.ONE_TIME,
        price: 20,
        priceAnchor: 40,
        isFeatured: true,
        features: [
          {
            name: "Finds the Best Candidates for your Product",
          },
          {
            name: "Suggests the Best Option",
          },
          {
            name: "Gets Results in Seconds",
          },
          {
            name: "Generates Full Classification Reports",
          },
          // {
          //   name: "Code Finder",
          //   details: "Unlimited Use of our Classification Assistant",
          // },
          // {
          //   name: "Classification Reports",
          //   // details:
          //   //   "In case customs asks questions or suppliers pull a fast one",
          // },
          // {
          //   name: "Access for 5 days",
          // },
        ],
      },
    ],
    // classifierPlans: [
    //   {
    //     priceId: process.env.NODE_ENV === "development" ? "7" : "8",
    //     name: PricingPlan.STANDARD,
    //     description: "Your Personal Classification Assistant",
    //     type: PricingType.SUBSCRIPTION,
    //     price: 30,
    //     priceAnchor: 45,
    //     features: [
    //       { name: "Unlimited Classifications" },
    //       { name: "Heading Discovery" },
    //       {
    //         name: "Best Candidate Suggestions at Every Level",
    //         details: "Based on the GRI & Additional US Rules",
    //       },
    //       { name: "Fetches Relevant Notes" },
    //       {
    //         name: "Built-in PDF Viewer",
    //         details: "No downloads needed to find what you're looking for!",
    //       },
    //     ],
    //   },
    //   {
    //     priceId: process.env.NODE_ENV === "development" ? "9" : "10",
    //     name: PricingPlan.PRO,
    //     description: "Automactically Generate & Download Reports", // & based on the USITC
    //     type: PricingType.SUBSCRIPTION,
    //     price: 40,
    //     priceAnchor: 60,
    //     isFeatured: true,
    //     features: [
    //       { name: "Everything in Standard, Plus:" },
    //       {
    //         name: "Generates Full Classification Reports",
    //         details: "Ready to share with clients or customs",
    //       },
    //       {
    //         name: "Saves all your classifications",
    //         details: "For easy access, reference, & auditability",
    //         comingSoon: true,
    //       },
    //     ],
    //   },
    // ],
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
