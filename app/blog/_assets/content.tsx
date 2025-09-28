import type { JSX } from "react";
import Image, { StaticImageData } from "next/image";
import brendanImg from "@/app/blog/_assets/images/authors/brendan.png";
import htsRevision20Img from "@/app/blog/_assets/images/hts-rev-20-image.png";
import Link from "next/link";

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
const categorySlugs: { [key: string]: string } = {
  feature: "feature",
  tutorial: "tutorial",
  tariffs: "tariffs",
};

// All the blog categories data display in the /blog/category/[categoryI].js pages.
export const categories: categoryType[] = [
  {
    // The slug to use in the URL, from the categorySlugs object above.
    slug: categorySlugs.feature,
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
    slug: categorySlugs.tutorial,
    title: "How To's & Tutorials",
    titleShort: "Tutorials",
    description:
      "Learn how to use ShipFast with these step-by-step tutorials. I'll show you how to ship faster and save time.",
    descriptionShort:
      "Learn how to use ShipFast with these step-by-step tutorials.",
  },
  {
    slug: categorySlugs.tariffs,
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
const authorSlugs: {
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
      "Brendan is a software engineer and an entrepreneur whose led software teams around the world. He's built systems that serve hundred of thousands of users and ",
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

export type articleType = {
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
};

// These styles are used in the content of the articles. When you update them, all articles will be updated.
const styles: {
  [key: string]: string;
} = {
  h2: "text-2xl lg:text-4xl font-bold tracking-tight mb-4 text-base-content",
  h3: "text-xl lg:text-2xl font-bold tracking-tight mb-2 text-base-content",
  p: "text-base-content/90 leading-relaxed",
  ul: "list-inside list-disc text-base-content/90 leading-relaxed",
  li: "list-item",
  // Altnernatively, you can use the library react-syntax-highlighter to display code snippets.
  code: "text-sm font-mono bg-neutral text-neutral-content p-6 rounded-box my-4 overflow-x-scroll select-all",
  codeInline:
    "text-sm font-mono bg-base-300 px-1 py-0.5 rounded-box select-all",
};

// All the blog articles data display in the /blog/[articleId].js pages.
export const articles: articleType[] = [
  {
    // The unique slug to use in the URL. It's also used to generate the canonical URL.
    slug: "new-tariffs-on-india",
    // The title to display in the article page (h1). Less than 60 characters. It's also used to generate the meta title.
    title: "India Hit with 25% Tariff for Russian Oil Use",
    // The description of the article to display in the article page. Up to 160 characters. It's also used to generate the meta description.
    description:
      "India has been hit with an additional 25% tariff for their use of Russian oil. This is a retaliatory measure by the United States to address 'threats' from Russia.",
    // An array of categories of the article. It's used to generate the category badges, the category filter, and more.
    categories: [
      categories.find((category) => category.slug === categorySlugs.tariffs),
    ],
    // The author of the article. It's used to generate a link to the author's bio page.
    author: authors.find((author) => author.slug === authorSlugs.brendan),
    // The date of the article. It's used to generate the meta date.
    publishedAt: "2025-09-28",
    image: {
      // The image to display in <CardArticle /> components.
      src: htsRevision20Img,
      // The relative URL of the same image to use in the Open Graph meta tags & the Schema Markup JSON-LD. It should be the same image as the src above.
      urlRelative: "/blog/hts-rev-20-image.png",
      alt: "HTS Revision 20 Image",
    },
    // The actual content of the article that will be shown under the <h1> title in the article page.
    content: (
      <>
        <Image
          src={htsRevision20Img}
          alt="HTS Revision 20 Image"
          width={700}
          height={500}
          priority={true}
          className="rounded-box"
        />
        <section>
          <h2 className={styles.h3}>Introduction</h2>
          <p className={styles.p}>
            On August 27th the United States imposed an additional 25% tariff on
            most imports from India.
          </p>
          <br />
          <p className={styles.p}>
            As published in this{" "}
            <a
              className="link link-primary font-bold"
              href="https://www.whitehouse.gov/presidential-actions/2025/08/addressing-threats-to-the-united-states-by-the-government-of-the-russian-federation/"
            >
              executive order from August 6th
            </a>
            , the United States is taking action to address "threats" from
            Russia.
          </p>
          <br />
          <p className={styles.p}>
            In this case, the United States is applying a 25% tariff on imports
            from India due to their consumption of Russia oil which props up the
            Russian economy.
          </p>
          <br />
          <h2 className={styles.h3}>Details</h2>
          <p className={styles.p}>
            The August 6th announcement stated that the HTS would be updated to
            reflect this measure, which has now happened. The details are as
            follows:
          </p>
          <br />
          <p className={styles.p}>
            <strong>Effective: </strong>August 27th, 2025
          </p>
          <p className={styles.p}>
            <strong>Source: </strong>
            <a
              className="link link-primary font-bold"
              href="https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099"
            >
              Chapter 99, Subchapter III, Note 2(z)(i-x)
            </a>
          </p>

          <p className={styles.p}>
            <strong>Updates: </strong>
          </p>

          <p className={styles.p}>
            The{" "}
            <a
              className="link"
              href="https://hts.usitc.gov/reststop/file?release=2025HTSRev20&filename=Change%20Record"
            >
              official change record
            </a>{" "}
            to the HTS highlights 6 new HTS Headings. <br />
            One for the new tariff itself and the expected series of exemption
            from that tariff for various reasons.
          </p>
          <br />

          <ul>
            <li>
              <a
                className="link link-primary font-bold"
                href="https://htshero.com/explore?code=9903.01.84"
              >
                9903.01.84
              </a>{" "}
              - 25% India Russian Oil Use Retaliatory Tariff
            </li>
            <li>
              <a
                className="link link-primary font-bold"
                href="https://htshero.com/explore?code=9903.01.85"
              >
                9903.01.85
              </a>{" "}
              - Exemption for goods of India already in transit
            </li>
            <li>
              <a
                className="link link-primary font-bold"
                href="https://htshero.com/explore?code=9903.01.86"
              >
                9903.01.86
              </a>{" "}
              - Exemption for critical goods
            </li>
            <li>
              <a
                className="link link-primary font-bold"
                href="https://htshero.com/explore?code=9903.01.87"
              >
                9903.01.87
              </a>{" "}
              - Exemption for Section 232 Articles
            </li>
            <li>
              <a
                className="link link-primary font-bold"
                href="https://htshero.com/explore?code=9903.01.88"
              >
                9903.01.88
              </a>{" "}
              - Exemption for Donations
            </li>
            <li>
              <a
                className="link link-primary font-bold"
                href="https://htshero.com/explore?code=9903.01.89"
              >
                9903.01.89
              </a>{" "}
              - Exemption for Information Materials
            </li>
          </ul>
          <br />

          <h2 className={styles.h3}>Check your Imports</h2>
          <p className={styles.p}>
            Knowing which imports are affected by certain tariffs or quality for
            exemptions has become overwhelming.
          </p>
          <br />

          <p className={styles.p}>
            To make sure you&apos;re importing at the best rates & see the full
            list of tariffs & exemptions for your imports, checkout checkout our
            free tariff impact checker.
          </p>
          <br />
          <Link href="/about/tariffs" className="btn btn-primary">
            See if your imports are affected
          </Link>
        </section>
      </>
    ),
  },
];
