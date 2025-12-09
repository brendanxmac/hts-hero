import Link from "next/link";
import {
  articleCategories,
  articleCategorySlugs,
  ArticleI,
  authors,
  authorSlugs,
} from "../_assets/types";
import { ArticleStyles } from "../_assets/styles";
import newTariffsExemptFromReciprocalTariffsImg from "@/app/blog/_assets/images/237.png";
import Image from "next/image";

const Article = (
  <>
    <Image
      src={newTariffsExemptFromReciprocalTariffsImg}
      alt="China Tariff Exemption Extensions Image"
      width={700}
      height={500}
      priority={true}
      className="rounded-box"
    />
    <section>
      <p className={ArticleStyles.p}>
        On November 13th the United States added 237 additional subheadings to
        the list of articles that are exempt for the reciprocal tariff.
      </p>
      <br />
      <p className={ArticleStyles.p}>
        Additionally, there were{" "}
        <span className="underline">
          11 special items mentioned that are also be exempt from reciprocal
          tariffs, but other items in the same subheading are not
        </span>
        .
      </p>
      <br />
      <p className={ArticleStyles.p}>
        Meaning, not all articles that fall under the same HTS Subheading as
        them qualify for the exemption as well.
      </p>
      <br />
      <p className={ArticleStyles.p}>
        What this boils down to is that{" "}
        <span className="font-bold italic">
          if you classify an item that falls under one of those subheadings, it
          may or many not actually be exempt, based on its own description.
        </span>
      </p>
      <br />
      <p className={ArticleStyles.p}>
        The full list of the items, and their matching subheadings is below for
        your future reference:
      </p>
      <br />

      <ul className="list-disc list-inside">
        <li>
          <b className="text-primary">0805.90.01</b> - Only Etrogs
        </li>
        <li>
          <b className="text-primary">0811.90.80</b> - Only Tropical fruit,
          nesoi, frozen, whether or not previously steamed or boiled
        </li>
        <li>
          <b className="text-primary">1404.90.90</b> - Only Date palm branches,
          Myrtus branches or other vegetable material, for religious purposes
          only
        </li>
        <li>
          <b className="text-primary">1905.90.10</b> - Only Bread, pastry,
          cakes, biscuits and similar baked products, nesoi, and puddings,
          whether or not containing chocolate, fruit, nuts or confectionery, for
          religious purposes only
        </li>
        <li>
          <b className="text-primary">1905.90.90</b> - Only Bakers’ wares,
          communion wafers, sealing wafers, rice paper and similar products,
          nesoi, for religious purposes only
        </li>
        <li>
          <b className="text-primary">2008.99.21</b> - Only Acai
        </li>
        <li>
          <b className="text-primary">2009.31.60</b> - Only Citrus juice of any
          single citrus fruit (other than orange, grapefruit or lime), of a Brix
          value not exceeding 20, concentrated, unfermented, except for lemon
          juice
        </li>
        <li>
          <b className="text-primary">2009.89.70</b> - Only Coconut water or
          juice of acai
        </li>
        <li>
          <b className="text-primary">2009.90.40</b> - Only Coconut water juice
          blends, not from concentrate, packaged for retail sale
        </li>
        <li>
          <b className="text-primary">2106.90.99</b> - Only Acai preparations
          for the manufacture of beverages
        </li>
        <li>
          <b className="text-primary">3301.29.51</b> - Only Essential oils other
          than those of citrus fruit, nesoi, for religious purposes only
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
        To find the latest correct tariffs for any import from any country,
        checkout our{" "}
        <Link href="/about/tariffs" className="link link-primary font-bold">
          Tariff Calculator
        </Link>
        . All you need to do is plug in your HTS code and you will see every
        tariff that could apply to that item.
      </p>
      <br />

      <p className={ArticleStyles.p}>
        To quickly check if an import is affected by new tariffs, you can use
        our{" "}
        <Link href="/about/tariffs" className="link link-primary font-bold">
          Tariff Impact Checker
        </Link>
        .
      </p>
    </section>
  </>
);

export const NewArticlesExemptFromReciprocalTariffsArticle: ArticleI = {
  // The unique slug to use in the URL. It's also used to generate the canonical URL.
  slug: "new-articles-exempt-from-reciprocal-tariffs",
  // The title to display in the article page (h1). Less than 60 characters. It's also used to generate the meta title.
  title: " New Articles Exempt from Reciprocal Tariffs",
  // The description of the article to display in the article page. Up to 160 characters. It's also used to generate the meta description.
  description: "Hundreds of articles are now exempt from the reciprocal tariff",
  // An array of categories of the article. It's used to generate the category badges, the category filter, and more.
  categories: [
    articleCategories.find(
      (category) => category.slug === articleCategorySlugs.tariffs
    ),
  ],
  // The author of the article. It's used to generate a link to the author's bio page.
  author: authors.find((author) => author.slug === authorSlugs.brendan),
  // The date of the article. It's used to generate the meta date.
  publishedAt: "2025-11-19",
  image: {
    // The image to display in <CardArticle /> components.
    src: newTariffsExemptFromReciprocalTariffsImg,
    // The relative URL of the same image to use in the Open Graph meta tags & the Schema Markup JSON-LD. It should be the same image as the src above.
    urlRelative: "/blog/237.png",
    alt: "New Reciprical Tariff Exempt Articles Image",
  },
  // The actual content of the article that will be shown under the <h1> title in the article page.
  content: Article,
};
