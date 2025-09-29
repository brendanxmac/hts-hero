import { ArticleI } from "./types";
import { IndiaRussianOilUseTariffArticle } from "../articles/india-russian-oil-use-tariff";
import { EndOfDeMinimisArticle } from "../articles/end-of-de-minimis";
import { ChinaTariffExemptionExtensionsArticle } from "../articles/china-tariff-exemptions-extensions";

// Re-export types and constants for backward compatibility
export {
  type categoryType,
  type authorType,
  type ArticleI,
  articleCategories,
  articleCategorySlugs,
  authors,
  authorSlugs,
} from "./types";

// All the blog articles data display in the /blog/[articleId].js pages.
export const articles: ArticleI[] = [
  IndiaRussianOilUseTariffArticle,
  EndOfDeMinimisArticle,
  ChinaTariffExemptionExtensionsArticle,
];
