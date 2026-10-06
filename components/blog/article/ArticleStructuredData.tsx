import config from "@/config";
import type { Author, Category, PostMeta } from "@/libs/blog/types";

const SITE = `https://${config.domainName}`;

// The post's JSON-LD: the article with its author and publisher, its breadcrumb trail, and
// its questions when it has any. Search engines and AI answers read these for attribution.
export function ArticleStructuredData({ post, category, author }: { post: PostMeta; category: Category; author: Author }) {
  const url = `${SITE}/blog/${post.slug}`;
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: post.title,
      description: post.description,
      image: `${url}/opengraph-image`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      articleSection: category.title,
      author: {
        "@type": "Person",
        name: author.name,
        jobTitle: author.role,
        url: `${SITE}/blog/author/${author.slug}`,
        sameAs: [author.linkedin],
      },
      publisher: {
        "@type": "Organization",
        name: config.appName,
        url: SITE,
        logo: { "@type": "ImageObject", url: `${SITE}/icon.svg` },
      },
      ...(post.sources.length > 0 && { citation: post.sources.map((s) => s.url) }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Blog", item: `${SITE}/blog` },
        { name: category.title, item: `${SITE}/blog/category/${category.slug}` },
        { name: post.title, item: url },
      ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
    },
  ];
  if (post.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }
  return (
    <>
      {schemas.map((schema) => (
        <script
          key={String(schema["@type"])}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
