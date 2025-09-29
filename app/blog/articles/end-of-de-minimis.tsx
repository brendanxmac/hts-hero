import Link from "next/link";
import {
  articleCategories,
  articleCategorySlugs,
  ArticleI,
  authors,
  authorSlugs,
} from "../_assets/types";
import { ArticleStyles } from "../_assets/styles";
import endOfDeMinimisImg from "@/app/blog/_assets/images/end-of-de-minimis.png";
import Image from "next/image";

const Article = (
  <>
    <Image
      src={endOfDeMinimisImg}
      alt="End of De Minimis Image"
      width={700}
      height={500}
      priority={true}
      className="rounded-box"
    />
    <section>
      <h2 className={ArticleStyles.h3}>Introduction</h2>
      <p className={ArticleStyles.p}>
        On August 29th the United States ended the &quot;de minimis&quot;
        exemption for imports below $800.
      </p>
      <p className={ArticleStyles.p}>
        This means that imports below $800 are now subject to taxes or tariffs.
      </p>
      <p className={ArticleStyles.p}>
        What tariffs you might ask? Here&apos;s the breakdown:
      </p>
      <br />
      <h2 className={ArticleStyles.h3}>Details</h2>
      <p className={ArticleStyles.p}>
        Imports &lt;= $800 Will Now Have to Pay{" "}
        <span className="underline">ONE</span> of the following based on country
        of origin:
      </p>
      <br />
      <p className={ArticleStyles.p}>A&#41; Effective Ad Valorem IEEPA Rate</p>
      <p className={ArticleStyles.p}>
        B&#41; <span className="underline">Flat Fee Per Item</span> Based on
        IEEPA Rate:
      </p>
      <p className={ArticleStyles.p}>Less than 16%: $80/item</p>
      <p className={ArticleStyles.p}>16-25%: $160/item</p>
      <p className={ArticleStyles.p}>Greater than 25%: $0/item</p>
      <br />
      <p className={ArticleStyles.p}>
        <strong>Effective: </strong>August 29th, 2025
      </p>
      <p className={ArticleStyles.p}>
        <strong>Source: </strong>
        <a
          className="link link-primary font-bold"
          href="https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099"
        >
          Chapter 99, Subchapter III, Note 2(y)
        </a>
      </p>
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

export const EndOfDeMinimisArticle: ArticleI = {
  // The unique slug to use in the URL. It's also used to generate the canonical URL.
  slug: "end-of-de-minimis",
  // The title to display in the article page (h1). Less than 60 characters. It's also used to generate the meta title.
  title: "The End of De Minimis",
  // The description of the article to display in the article page. Up to 160 characters. It's also used to generate the meta description.
  description:
    "Imports below $800 are no longer exempt from taxes or tariffs... But what's the new rate?",
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
    src: endOfDeMinimisImg,
    // The relative URL of the same image to use in the Open Graph meta tags & the Schema Markup JSON-LD. It should be the same image as the src above.
    urlRelative: "/blog/hts-rev-20-image.png",
    alt: "End of De Minimis Image",
  },
  // The actual content of the article that will be shown under the <h1> title in the article page.
  content: Article,
};
