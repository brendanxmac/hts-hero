import { StripePaymentMode } from "../libs/stripe";

export enum DaisyTheme {
  LIGHT = "light",
  DARK = "dark",
  // CUPCAKE = "cupcake",
  // BUMBLEBEE = "bumblebee",
  // EMERALD = "emerald",
  // CORPORATE = "corporate",
  // SYNTHWAVE = "synthwave",
  // RETRO = "retro",
  // CYBERPUNK = "cyberpunk",
  // VALENTINE = "valentine",
  // HALLOWEEN = "halloween",
  // GARDEN = "garden",
  // FOREST = "forest",
  // AQUA = "aqua",
  // LOFI = "lofi",
  // PASTEL = "pastel",
  // FANTASTY = "fantasy",
  // WIREFRAME = "wireframe",
  BLACK = "black",
  // LUXURY = "luxury",
  // DRACULA = "dracula",
  // CMYK = "cmyk",
  // AUTUM = "autumn",
  // BUSINESS = "business",
  // ACID = "acid",
  // LEMONADE = "lemonade",
  // NIGHT = "night",
  // COFFEE = "coffee",
  // WINTER = "winter",
  // DIM = "dim",
  // NORD = "nord",
  // SUNSET = "sunset",
}

export type Theme = "black" | "light" | "dark" | "";
// | "cupcake"
// | "bumblebee"
// | "emerald"
// | "corporate"
// | "synthwave"
// | "retro"
// | "cyberpunk"
// | "valentine"
// | "halloween"
// | "garden"
// | "forest"
// | "aqua"
// | "lofi"
// | "pastel"
// | "fantasy"
// | "wireframe"
// | "luxury"
// | "dracula"
// | "cmyk"
// | "autumn"
// | "business"
// | "acid"
// | "lemonade"
// | "night"
// | "coffee"
// | "winter"
// | "dim"
// | "nord"
// | "sunset"
// | "";

export enum PricingPlan {
  CLASSIFY_PRO = "Classify Pro",
  CLASSIFY_TEAM = "Classify for Teams",
  TARIFF_IMPACT_STARTER = "Tariff Impact Starter",
  TARIFF_IMPACT_STANDARD = "Tariff Impact Standard",
  TARIFF_IMPACT_PRO = "Tariff Impact Pro",
}

export interface PricingFeatureI {
  name: string;
  details?: string;
  comingSoon?: boolean;
  roadmap?: boolean;
}

export interface PricingPlanI {
  isFeatured?: boolean;
  isCompetitor?: boolean;
  mode: StripePaymentMode;
  // priceId: string;
  name: string;
  planIdentifier: PricingPlan;
  description?: string;
  prices: number[];
  // promotionCode?: string;
  priceAnchors?: number[];
  priceTiers?: string[];
  features: PricingFeatureI[];
}

export interface ConfigProps {
  appName: string;
  appDescription: string;
  domainName: string;
  crisp: {
    id?: string;
    onlyShowOnRoutes?: string[];
  };
  stripe: {
    // importerPlans: PricingPlanI[];
    classifierPlans: PricingPlanI[];
    classifierConversionPlans: PricingPlanI[];
    tariffImpactPlans: PricingPlanI[];
  };
  aws?: {
    bucket?: string;
    bucketUrl?: string;
    cdn?: string;
  };
  resend: {
    fromNoReply: string;
    fromAdmin: string;
    supportEmail?: string;
  };
  colors: {
    theme: Theme;
    main: string;
  };
  auth: {
    loginUrl: string;
    callbackUrl: string;
  };
}
