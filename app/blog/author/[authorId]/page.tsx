import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorCard, BlogBreadcrumbs, PostGrid } from "@/components/blog";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { AUTHORS, authorBySlug } from "@/libs/blog/catalog";
import { getPostsByAuthor } from "@/libs/blog/posts";
import config from "@/config";

interface Props {
  params: { authorId: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return AUTHORS.map((a) => ({ authorId: a.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const author = authorBySlug(params.authorId);
  if (!author) return {};
  return {
    title: `${author.name}, ${author.role} | HTS Hero Blog`,
    description: author.bio.slice(0, 158),
    alternates: { canonical: `/blog/author/${author.slug}` },
  };
}

export default function BlogAuthorPage({ params }: Props) {
  const author = authorBySlug(params.authorId);
  if (!author) notFound();
  const posts = getPostsByAuthor(author.slug);
  // The author as a Person, linked to their profile: how search engines tie posts to an expert
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: author.name,
      jobTitle: author.role,
      description: author.bio,
      image: `https://${config.domainName}${author.avatar}`,
      sameAs: [author.linkedin],
      worksFor: { "@type": "Organization", name: config.appName, url: `https://${config.domainName}` },
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <header className="w-full border-b border-base-300">
        <div className={`${ui.container} flex flex-col gap-6 pb-10 pt-6`}>
          <BlogBreadcrumbs trail={[{ href: "/blog", label: "Blog" }, { label: author.name }]} />
          <h1 className={ui.pageTitle}>{author.name}</h1>
          <div className="max-w-4xl">
            <AuthorCard author={author} />
          </div>
        </div>
      </header>
      <div className={`${ui.container} ${ui.bandPadding}`}>
        <section className={ui.section}>
          <SectionHeader kicker="Articles" title={`Written by ${author.name.split(" ")[0]}`} />
          <PostGrid posts={posts} />
        </section>
      </div>
    </>
  );
}
