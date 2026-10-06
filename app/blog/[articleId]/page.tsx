import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/blog";
import { authorBySlug, categoryBySlug } from "@/libs/blog/catalog";
import { getPost, getPosts, getRelatedPosts } from "@/libs/blog/posts";
import config from "@/config";

interface Props {
  params: { articleId: string };
}

// Every post is built ahead of time; an unknown slug is a 404, not a render
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ articleId: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPost(params.articleId);
  if (!post) return {};
  const author = authorBySlug(post.author);
  return {
    title: `${post.title} | HTS Hero`,
    description: post.description,
    authors: author ? [{ name: author.name, url: `/blog/author/${author.slug}` }] : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://${config.domainName}/blog/${post.slug}`,
      siteName: config.appName,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: author ? [author.name] : undefined,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.articleId);
  if (!post) notFound();
  const category = categoryBySlug(post.category);
  const author = authorBySlug(post.author);
  if (!category || !author) notFound();
  return <ArticlePage post={post} category={category} author={author} related={getRelatedPosts(post)} />;
}
