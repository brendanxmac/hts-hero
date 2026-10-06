import { BlogIndex } from "@/components/blog";
import { CATEGORIES } from "@/libs/blog/catalog";
import { getPosts, getPostsInCategory } from "@/libs/blog/posts";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "US Tariff Guides, Updates & HTS Revisions | HTS Hero Blog",
  description:
    "How US import duty works, how tariffs stack, and every change to the Harmonized Tariff Schedule, explained by the team behind HTS Hero's tariff calculator.",
  extraTags: {
    alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/feed.xml" } },
  },
  openGraph: {
    title: "US Tariff Guides, Updates & HTS Revisions | HTS Hero Blog",
    description: "How US import duty works, how tariffs stack, and every change to the Harmonized Tariff Schedule.",
    url: "/blog",
  },
});

export default function BlogPage() {
  const featured = getPosts().filter((p) => p.featured);
  const sections = CATEGORIES.map((category) => ({ category, posts: getPostsInCategory(category.slug) })).filter(
    (s) => s.posts.length > 0
  );
  return <BlogIndex featured={featured} sections={sections} />;
}
