import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { AUTHORS, CATEGORIES } from "./catalog";
import { extractHeadings } from "./headings";
import type { CategorySlug, Post, PostMeta } from "./types";

// Posts are MDX files in content/blog, named by slug. They're read when the site builds, so
// every blog page is static.

const POSTS_DIR = path.join(process.cwd(), "content/blog");

const WORDS_PER_MINUTE = 230;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");

// A bad frontmatter field fails the build with the file and field named, not a broken page
const frontmatterSchema = z.object({
  title: z.string().min(1).max(110),
  description: z.string().min(1).max(200),
  category: z.enum(CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]]),
  cta: z.enum(["calculator", "history", "tracker", "classify"]),
  author: z.enum(AUTHORS.map((a) => a.slug) as [string, ...string[]]).default("brendan"),
  publishedAt: isoDate,
  updatedAt: isoDate.optional(),
  featured: z.boolean().default(false),
  featuredOrder: z.number().default(99),
  revision: z.number().int().positive().optional(),
  takeaways: z.array(z.string()).default([]),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});

// YAML turns unquoted dates into Date objects; the schema wants the YYYY-MM-DD string back
const normalizeDates = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value instanceof Date ? value.toISOString().slice(0, 10) : value])
  );

const readPost = (file: string): Post => {
  const slug = file.replace(/\.mdx$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
  const parsed = frontmatterSchema.safeParse(normalizeDates(data));
  if (!parsed.success) {
    throw new Error(`content/blog/${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  }
  // The schema guarantees every field; without strictNullChecks zod's inferred type can't say so
  const fm = parsed.data as Omit<PostMeta, "slug" | "updatedAt" | "readingMinutes"> & { updatedAt?: string };
  return {
    ...fm,
    slug,
    updatedAt: fm.updatedAt ?? fm.publishedAt,
    readingMinutes: Math.max(1, Math.round(content.split(/\s+/).length / WORDS_PER_MINUTE)),
    body: content,
    headings: extractHeadings(content),
  };
};

let cache: Post[] | null = null;

// Every post, newest first
const allPosts = (): Post[] => {
  if (!cache || process.env.NODE_ENV === "development") {
    cache = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map(readPost)
      .sort(
        (a, b) =>
          b.publishedAt.localeCompare(a.publishedAt) || (b.revision ?? 0) - (a.revision ?? 0) || a.title.localeCompare(b.title)
      );
  }
  return cache;
};

const toMeta = ({ body: _body, headings: _headings, ...meta }: Post): PostMeta => meta;

export const getPosts = (): PostMeta[] => allPosts().map(toMeta);

export const getPost = (slug: string): Post | undefined => allPosts().find((p) => p.slug === slug);

export const getPostsInCategory = (category: CategorySlug) => getPosts().filter((p) => p.category === category);

export const getPostsByAuthor = (author: string) => getPosts().filter((p) => p.author === author);

// Same category first, then the most recent of the rest
export const getRelatedPosts = (post: PostMeta, count = 3) => {
  const others = getPosts().filter((p) => p.slug !== post.slug);
  const sameCategory = others.filter((p) => p.category === post.category);
  const rest = others.filter((p) => p.category !== post.category);
  return [...sameCategory, ...rest].slice(0, count);
};
