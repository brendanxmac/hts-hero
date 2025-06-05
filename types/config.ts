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
  Starter = "Starter",
  Standard = "Standard",
  Pro = "Pro",
  Explore = "Explore",
  Classify = "Classify",
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
    plans: {
      isFeatured?: boolean;
      priceId: string;
      name: PricingPlan;
      description?: string;
      price: number;
      priceAnchor?: number;
      features: {
        name: string;
        details?: string;
        comingSoon?: boolean;
      }[];
    }[];
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
