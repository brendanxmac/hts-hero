import Link from "next/link";
import {
  articleCategories,
  articleCategorySlugs,
  ArticleI,
  authors,
  authorSlugs,
} from "../_assets/types";
import { ArticleStyles } from "../_assets/styles";
import htsRevision20Img from "@/app/blog/_assets/images/hts-rev-20-image.png";
import Image from "next/image";

const Article = (
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
      <h2 className={ArticleStyles.h3}>Introduction</h2>
      <p className={ArticleStyles.p}>
        On August 27th the United States imposed an additional 25% tariff on
        most imports from India.
      </p>
      <br />
      <p className={ArticleStyles.p}>
        As published in this{" "}
        <a
          className="link link-primary font-bold"
          href="https://www.whitehouse.gov/presidential-actions/2025/08/addressing-threats-to-the-united-states-by-the-government-of-the-russian-federation/"
        >
          executive order from August 6th
        </a>
        , the United States is taking action to address &quot;threats&quot; from
        Russia.
      </p>
      <br />
      <p className={ArticleStyles.p}>
        In this case, the United States is applying a 25% tariff on imports from
        India due to their consumption of Russia oil which props up the Russian
        economy.
      </p>
      <br />
      <h2 className={ArticleStyles.h3}>Details</h2>
      <p className={ArticleStyles.p}>
        The August 6th announcement stated that the HTS would be updated to
        reflect this measure, which has now happened. The details are as
        follows:
      </p>
      <br />
      <p className={ArticleStyles.p}>
        <strong>Effective: </strong>August 27th, 2025
      </p>
      <p className={ArticleStyles.p}>
        <strong>Source: </strong>
        <a
          className="link link-primary font-bold"
          href="https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099"
        >
          Chapter 99, Subchapter III, Note 2(z)(i-x)
        </a>
      </p>

      <p className={ArticleStyles.p}>
        <strong>Updates: </strong>
      </p>

      <p className={ArticleStyles.p}>
        The{" "}
        <a
          className="link"
          href="https://hts.usitc.gov/reststop/file?release=2025HTSRev20&filename=Change%20Record"
        >
          official change record
        </a>{" "}
        to the HTS highlights 6 new HTS Headings. <br />
        One for the new tariff itself and the expected series of exemption from
        that tariff for various reasons.
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

export const IndiaRussianOilUseTariffArticle: ArticleI = {
  // The unique slug to use in the URL. It's also used to generate the canonical URL.
  slug: "new-tariffs-on-india",
  // The title to display in the article page (h1). Less than 60 characters. It's also used to generate the meta title.
  title: "India Hit with 25% Tariff for Russian Oil Use",
  // The description of the article to display in the article page. Up to 160 characters. It's also used to generate the meta description.
  description:
    "India has been hit with an additional 25% tariff for their use of Russian oil. This is a retaliatory measure by the United States to address 'threats' from Russia.",
  // An array of categories of the article. It's used to generate the category badges, the category filter, and more.
  categories: [
    articleCategories.find(
      (category) => category.slug === articleCategorySlugs.tariffs
    ),
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
  content: Article,
};
