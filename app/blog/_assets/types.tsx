import type { JSX } from "react";
import { StaticImageData } from "next/image";
import brendanImg from "@/app/blog/_assets/images/authors/brendan.png";

// ==================================================================================================================================================================
// BLOG CATEGORIES 🏷️
// ==================================================================================================================================================================

export type categoryType = {
  slug: string;
  title: string;
  titleShort?: string;
  description: string;
  descriptionShort?: string;
};

// These slugs are used to generate pages in the /blog/category/[categoryI].js. It's a way to group articles by category.
export const articleCategorySlugs: { [key: string]: string } = {
  feature: "feature",
  tutorial: "tutorial",
  tariffs: "tariffs",
};

// All the blog categories data display in the /blog/category/[categoryI].js pages.
export const articleCategories: categoryType[] = [
  {
    // The slug to use in the URL, from the categorySlugs object above.
    slug: articleCategorySlugs.feature,
    // The title to display the category title (h1), the category badge, the category filter, and more. Less than 60 characters.
    title: "New Features",
    // A short version of the title above, display in small components like badges. 1 or 2 words
    titleShort: "Features",
    // The description of the category to display in the category page. Up to 160 characters.
    description:
      "Here are the latest features we've added to ShipFast. I'm constantly improving our product to help you ship faster.",
    // A short version of the description above, only displayed in the <Header /> on mobile. Up to 60 characters.
    descriptionShort: "Latest features added to ShipFast.",
  },
  {
    slug: articleCategorySlugs.tutorial,
    title: "How To's & Tutorials",
    titleShort: "Tutorials",
    description:
      "Learn how to use ShipFast with these step-by-step tutorials. I'll show you how to ship faster and save time.",
    descriptionShort:
      "Learn how to use ShipFast with these step-by-step tutorials.",
  },
  {
    slug: articleCategorySlugs.tariffs,
    title: "Tariff Updates",
    titleShort: "Tariff Updates",
    description:
      "Updates on tariff changes and announcements to help you stay ontop of it all",
    descriptionShort: "Stay updated on the latest tariff updates",
  },
];

// ==================================================================================================================================================================
// BLOG AUTHORS 📝
// ==================================================================================================================================================================

export type authorType = {
  slug: string;
  name: string;
  job: string;
  description: string;
  avatar: StaticImageData | string;
  socials?: {
    name: string;
    icon: JSX.Element;
    url: string;
  }[];
};

// Social icons used in the author's bio.
const socialIcons: {
  [key: string]: {
    name: string;
    svg: JSX.Element;
  };
} = {
  twitter: {
    name: "Twitter",
    svg: (
      <svg
        version="1.1"
        id="svg5"
        x="0px"
        y="0px"
        viewBox="0 0 1668.56 1221.19"
        className="w-9 h-9 fill-white"
      >
        <g id="layer1" transform="translate(52.390088,-25.058597)">
          <path
            id="path1009"
            d="M283.94,167.31l386.39,516.64L281.5,1104h87.51l340.42-367.76L984.48,1104h297.8L874.15,558.3l361.92-390.99   h-87.51l-313.51,338.7l-253.31-338.7H283.94z M412.63,231.77h136.81l604.13,807.76h-136.81L412.63,231.77z"
          />
        </g>
      </svg>
    ),
  },
  linkedin: {
    name: "LinkedIn",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 fill-white"
        viewBox="0 0 24 24"
      >
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
      </svg>
    ),
  },
};

// These slugs are used to generate pages in the /blog/author/[authorId].js. It's a way to show all articles from an author.
export const authorSlugs: {
  [key: string]: string;
} = {
  brendan: "brendan",
};

// All the blog authors data display in the /blog/author/[authorId].js pages.
export const authors: authorType[] = [
  {
    // The slug to use in the URL, from the authorSlugs object above.
    slug: authorSlugs.brendan,
    // The name to display in the author's bio. Up to 60 characters.
    name: "Brendan Mclaughlin",
    // The job to display in the author's bio. Up to 60 characters.
    job: "Founder of HTS Hero",
    // The description of the author to display in the author's bio. Up to 160 characters.
    description:
      "Brendan is a software engineer and an entrepreneur whose led software teams around the world & built systems that serve hundred of thousands of people.",
    // The avatar of the author to display in the author's bio and avatar badge. It's better to use a local image, but you can also use an external image (https://...)
    avatar: brendanImg,
    // A list of social links to display in the author's bio.
    socials: [
      {
        name: socialIcons.linkedin.name,
        icon: socialIcons.linkedin.svg,
        url: "https://www.linkedin.com/in/brendan-mclaughlin-profile/",
      },
    ],
  },
];

// ==================================================================================================================================================================
// BLOG ARTICLES 📚
// ==================================================================================================================================================================

export interface ArticleI {
  slug: string;
  title: string;
  description: string;
  categories: categoryType[];
  author: authorType;
  publishedAt: string;
  image: {
    src?: StaticImageData;
    urlRelative: string;
    alt: string;
  };
  content: JSX.Element;
}
