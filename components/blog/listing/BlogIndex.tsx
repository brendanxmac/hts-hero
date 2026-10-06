import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { Category, PostMeta } from "@/libs/blog/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { CtaPanel } from "../cta/CtaPanel";
import { BlogHero } from "./BlogHero";
import { CategoryNav } from "./CategoryNav";
import { PostGrid } from "./PostGrid";

const PER_SECTION = 6;

// /blog: the essentials first, then the latest posts in each category
export function BlogIndex({
  featured,
  sections,
}: {
  featured: PostMeta[];
  sections: { category: Category; posts: PostMeta[] }[];
}) {
  const nav = sections.map(({ category, posts }) => ({ ...category, count: posts.length }));
  // Featured posts are already at the top, so the category sections show the rest
  const featuredSlugs = new Set(featured.map((p) => p.slug));
  const rest = sections
    .map((s) => ({ ...s, posts: s.posts.filter((p) => !featuredSlugs.has(p.slug)) }))
    .filter((s) => s.posts.length > 0);
  return (
    <>
      <BlogHero
        kicker="HTS Hero Blog"
        title="US Tariffs Explained"
        lead="How US import duty actually works, and a running record of every change to the Harmonized Tariff Schedule. Written by the people who build and maintain HTS Hero's tariff calculator."
      >
        <CategoryNav categories={nav} />
      </BlogHero>

      <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
        {featured.length > 0 && (
          <section className={ui.section}>
            <SectionHeader kicker="Start here" title="The essentials of US tariffs">
              What tariffs are, how US duty is calculated, and how the programs stack on one import.
            </SectionHeader>
            <PostGrid posts={featured} />
          </section>
        )}

        {rest.map(({ category, posts }) => (
          <section key={category.slug} className={ui.section}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeader kicker={category.title} title={`Latest in ${category.title}`}>
                {category.description}
              </SectionHeader>
              {posts.length > PER_SECTION && (
                <Link href={`/blog/category/${category.slug}`} className={`${ui.link} inline-flex items-center gap-1 text-sm`}>
                  All {posts.length} articles
                  <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
            <PostGrid posts={posts.slice(0, PER_SECTION)} showCategory={false} />
          </section>
        ))}
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <CtaPanel kind="calculator" secondary={{ href: "/pricing-calculator", label: "See pricing" }} />
        </div>
      </div>
    </>
  );
}
