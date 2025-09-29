import { articleCategories, articles } from "./_assets/content";
import CardArticle from "./_assets/components/CardArticle";
import CardCategory from "./_assets/components/CardCategory";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `${config.appName} Blog`,
  description: "The latest updates on tariffs, HTS codes, and more",
  canonicalUrlRelative: "/blog",
});

export default async function Blog() {
  const articlesToDisplay = articles
    .sort(
      (a, b) =>
        new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf()
    )
    .slice(0, 6);
  return (
    <>
      <section className="text-center max-w-xl mx-auto mt-6 mb-12">
        <h1 className="text-white font-extrabold text-3xl lg:text-5xl tracking-tight mb-6">
          Stay Up to Date on The{" "}
          <span className="text-primary">Latest HTS Updates</span>
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          The latest updates on HTS codes, tariffs, and all of {config.appName}
          &apos;s product updates & deals.
        </p>
      </section>

      <section className="grid lg:grid-cols-2 mb-24 md:mb-32 gap-8">
        {articlesToDisplay.map((article, i) => (
          <CardArticle
            article={article}
            key={article.slug}
            isImagePriority={i <= 2}
          />
        ))}
      </section>

      <section>
        <p className="font-bold text-2xl lg:text-4xl tracking-tight text-center mb-8 md:mb-12">
          Browse articles by category
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {articleCategories.map((category) => (
            <CardCategory key={category.slug} category={category} tag="div" />
          ))}
        </div>
      </section>
    </>
  );
}
