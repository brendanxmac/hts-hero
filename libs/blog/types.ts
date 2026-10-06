// The shapes of blog posts, categories and authors. Posts are MDX files in content/blog; their
// frontmatter is validated against these types when the site builds (see posts.ts).

export type CategorySlug = "guides" | "tariffs" | "hts-revisions" | "product";

// Which HTS Hero tool a post sells. Each one has its own call to action (components/blog/cta).
export type CtaKind = "calculator" | "history" | "tracker" | "classify";

export interface Category {
  slug: CategorySlug;
  title: string;
  // For the category page's <h1> and meta description, under 160 characters
  description: string;
}

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  // Shown under the title, in cards and as the meta description: under 160 characters
  description: string;
  category: CategorySlug;
  cta: CtaKind;
  author: string;
  publishedAt: string;
  updatedAt: string;
  // Pinned to the top of the blog index
  featured: boolean;
  // A few short facts shown in a box at the top of the post: what an LLM or a skimmer should take away
  takeaways: string[];
  sources: Source[];
  faqs: Faq[];
  readingMinutes: number;
}

export interface Post extends PostMeta {
  // The MDX body, without frontmatter
  body: string;
  // The post's ## headings, for its table of contents
  headings: { id: string; text: string }[];
}
