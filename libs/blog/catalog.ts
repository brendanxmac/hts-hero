import type { Author, Category, CategorySlug } from "./types";

export const CATEGORIES: Category[] = [
  {
    slug: "guides",
    title: "Tariff Guides",
    description:
      "Plain-English guides to how US tariffs work: what they are, how duty is calculated, and how the programs stack on top of each other.",
  },
  {
    slug: "tariffs",
    title: "Tariff Updates",
    description:
      "New US tariffs, exemptions and changes as they're announced, with what they mean for your imports and the legal text behind them.",
  },
  {
    slug: "hts-revisions",
    title: "HTS Revisions",
    description:
      "Every revision of the 2026 Harmonized Tariff Schedule, broken down: which Chapter 99 headings changed, when, and which imports are affected.",
  },
  {
    slug: "product",
    title: "Product Updates",
    description: "New features and improvements in HTS Hero's tariff calculator, tracker and classification tools.",
  },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export const isCategorySlug = (slug: string): slug is CategorySlug => CATEGORIES.some((c) => c.slug === slug);

export const AUTHORS: Author[] = [
  {
    slug: "brendan",
    name: "Brendan McLaughlin",
    role: "Founder of HTS Hero",
    bio: "Brendan is the founder of HTS Hero and a self-proclaimed tariff nerd. He has spent more than a year building and maintaining HTS Hero's tariff calculator, which meant reading every government tariff update and all 4,000+ pages of the Harmonized Tariff Schedule, across many revisions. He writes about US tariffs regularly on LinkedIn.",
    avatar: "/blog/authors/brendan.png",
    linkedin: "https://www.linkedin.com/in/brendan-mclaughlin-profile/",
  },
];

export const authorBySlug = (slug: string) => AUTHORS.find((a) => a.slug === slug);
