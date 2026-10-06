import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogBreadcrumbs, BlogHero, CategoryNav, CtaPanel, PostGrid } from "@/components/blog";
import { CATEGORIES, categoryBySlug } from "@/libs/blog/catalog";
import { getPostsInCategory } from "@/libs/blog/posts";
import type { CategorySlug } from "@/libs/blog/types";
import * as ui from "@/components/ui/styles";

interface Props {
  params: { categoryId: string };
}

export const dynamicParams = false;

// Only categories with posts get a page
const categoriesWithPosts = () =>
  CATEGORIES.map((c) => ({ ...c, count: getPostsInCategory(c.slug).length })).filter((c) => c.count > 0);

export function generateStaticParams() {
  return categoriesWithPosts().map((c) => ({ categoryId: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const category = categoryBySlug(params.categoryId);
  if (!category) return {};
  return {
    title: `${category.title} | HTS Hero Blog`,
    description: category.description,
    alternates: { canonical: `/blog/category/${category.slug}` },
  };
}

// The tool each category's readers are most likely to need next
const CATEGORY_CTA = {
  guides: "calculator",
  tariffs: "tracker",
  "hts-revisions": "history",
  product: "calculator",
} as const satisfies Record<CategorySlug, string>;

export default function BlogCategoryPage({ params }: Props) {
  const category = categoryBySlug(params.categoryId);
  if (!category) notFound();
  const posts = getPostsInCategory(category.slug);
  return (
    <>
      <BlogHero
        kicker="HTS Hero Blog"
        title={category.title}
        lead={category.description}
        breadcrumbs={<BlogBreadcrumbs trail={[{ href: "/blog", label: "Blog" }, { label: category.title }]} />}
      >
        <CategoryNav categories={categoriesWithPosts()} current={category.slug} />
      </BlogHero>

      <div className={`${ui.container} ${ui.bandPadding}`}>
        <PostGrid posts={posts} showCategory={false} />
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <CtaPanel kind={CATEGORY_CTA[category.slug]} />
        </div>
      </div>
    </>
  );
}
