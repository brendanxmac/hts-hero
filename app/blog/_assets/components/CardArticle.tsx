import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import Avatar from "./Avatar";
import { ArticleI } from "../content";

// This is the article card that appears in the home page, in the category page, and in the author's page
const CardArticle = ({
  article,
  tag = "h2",
  showCategory = true,
  isImagePriority = false,
}: {
  article: ArticleI;
  tag?: keyof JSX.IntrinsicElements;
  showCategory?: boolean;
  isImagePriority?: boolean;
}) => {
  const TitleTag = tag;

  return (
    <article className="card bg-base-200 rounded-box overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
      <Link
        href={`/blog/${article.slug}`}
        className="block cursor-pointer"
        rel="bookmark"
      >
        {article.image?.src && (
          <figure>
            <Image
              src={article.image.src}
              alt={article.image.alt}
              width={600}
              height={338}
              priority={isImagePriority}
              className="aspect-auto object-center object-fill"
            />
          </figure>
        )}
        <div className="card-body">
          {/* CATEGORIES */}
          {showCategory && (
            <div className="flex flex-wrap gap-2">
              {article.categories.map((category) => (
                <span
                  key={category.slug}
                  className="badge badge-sm badge-primary font-bold md:badge-md"
                >
                  {category.titleShort}
                </span>
              ))}
            </div>
          )}

          {/* TITLE WITH RIGHT TAG */}
          <TitleTag className="mb-1 text-xl md:text-2xl font-bold">
            {article.title}
          </TitleTag>

          <div className=" text-base-content/80 space-y-4">
            {/* DESCRIPTION */}
            <p className="">{article.description}</p>

            {/* AUTHOR & DATE */}
            <div className="flex items-center gap-4 text-sm">
              <Avatar article={article} isLink={false} />

              <span itemProp="datePublished">
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default CardArticle;
