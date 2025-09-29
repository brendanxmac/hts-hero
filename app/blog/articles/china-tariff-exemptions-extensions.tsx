import Link from "next/link";
import {
  articleCategories,
  articleCategorySlugs,
  ArticleI,
  authors,
  authorSlugs,
} from "../_assets/types";
import { ArticleStyles } from "../_assets/styles";
import chinaExemptionsExtendedImg from "@/app/blog/_assets/images/china-exemptions-extended.png";
import Image from "next/image";

const Article = (
  <>
    <Image
      src={chinaExemptionsExtendedImg}
      alt="China Tariff Exemption Extensions Image"
      width={700}
      height={500}
      priority={true}
      className="rounded-box"
    />
    <section>
      <h2 className={ArticleStyles.h3}>Introduction</h2>
      <p className={ArticleStyles.p}>
        On September 1st the United States extended two tariff exemptions on
        imports from China.
      </p>
      <br />
      <p className={ArticleStyles.p}>
        The exemptions, 9903.88.69 and 9903.88.70, were originally set to expire
        on August 31st, 2025 and January 1st, 2025 respectively.
      </p>
      <br />
      <h2 className={ArticleStyles.h3}>Details</h2>
      <p className={ArticleStyles.p}>
        However both have now been extended and have the same expiry date of
        November 29th, 2025.
      </p>
      <br />
      <p className={ArticleStyles.p}>
        It&apos;s not much time... but it&apos;s something, and there&apos;s
        hope that a deal between the U.S. and China get struck between now and
        then (even if only a little).
      </p>
      <br />

      <ul>
        <li>
          <a
            className="link link-primary font-bold"
            href="https://htshero.com/explore?code=9903.88.69"
          >
            9903.88.69
          </a>{" "}
          - Effective June 15, 2024 - November 29, 2025
        </li>
        <li>
          <a
            className="link link-primary font-bold"
            href="https://htshero.com/explore?code=9903.88.70"
          >
            9903.88.70
          </a>{" "}
          - Effective January 1, 2025 - November 29, 2025
        </li>
      </ul>
      <br />
      <br />

      <h2 className={ArticleStyles.h3}>
        Struggling to Keep Up With Tariff Changes?
      </h2>
      <p className={ArticleStyles.p}>
        Keeping track of the growing number of tariffs and exemptions that apply
        to any import has become overwhelming.
      </p>
      <br />

      <p className={ArticleStyles.p}>
        To quickly check if an import is affected by new tariffs checkout our
        free Tariff Impact Checker.
      </p>

      <br />
      <Link href="/about/tariffs" className="btn btn-primary">
        Get Notified Tariffs Affect your Imports
      </Link>
    </section>
  </>
);

export const ChinaTariffExemptionExtensionsArticle: ArticleI = {
  // The unique slug to use in the URL. It's also used to generate the canonical URL.
  slug: "china-tariff-exemption-extensions",
  // The title to display in the article page (h1). Less than 60 characters. It's also used to generate the meta title.
  title: "China Tariff Exemption Have Been Extended",
  // The description of the article to display in the article page. Up to 160 characters. It's also used to generate the meta description.
  description:
    "The United States has extended two tariff exemptions on imports from China",
  // An array of categories of the article. It's used to generate the category badges, the category filter, and more.
  categories: [
    articleCategories.find(
      (category) => category.slug === articleCategorySlugs.tariffs
    ),
  ],
  // The author of the article. It's used to generate a link to the author's bio page.
  author: authors.find((author) => author.slug === authorSlugs.brendan),
  // The date of the article. It's used to generate the meta date.
  publishedAt: "2025-09-29",
  image: {
    // The image to display in <CardArticle /> components.
    src: chinaExemptionsExtendedImg,
    // The relative URL of the same image to use in the Open Graph meta tags & the Schema Markup JSON-LD. It should be the same image as the src above.
    urlRelative: "/blog/hts-rev-20-image.png",
    alt: "China Tariff Exemption Extensions Image",
  },
  // The actual content of the article that will be shown under the <h1> title in the article page.
  content: Article,
};
