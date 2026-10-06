import type { Author, Category, Post, PostMeta } from "@/libs/blog/types";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { CtaPanel } from "../cta/CtaPanel";
import { RailCta } from "../cta/RailCta";
import { PostGrid } from "../listing/PostGrid";
import { ArticleBody } from "./ArticleBody";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleStructuredData } from "./ArticleStructuredData";
import { AuthorCard } from "./AuthorCard";
import { KeyTakeaways } from "./KeyTakeaways";
import { SourceList } from "./SourceList";
import { TableOfContents } from "./TableOfContents";

// A blog post: the header band, then the text with a rail of contents and the post's tool
// pitch, then sources, questions and the author, related reading and a closing call to action.
export function ArticlePage({
  post,
  category,
  author,
  related,
}: {
  post: Post;
  category: Category;
  author: Author;
  related: PostMeta[];
}) {
  const contents = [
    ...post.headings,
    ...(post.faqs.length > 0 ? [{ id: "faq", text: "Frequently asked questions" }] : []),
    ...(post.sources.length > 0 ? [{ id: "sources", text: "Sources" }] : []),
  ];

  return (
    <article>
      <ArticleStructuredData post={post} category={category} author={author} />

      <header className="w-full border-b border-base-300">
        <div className={`${ui.container} pb-10 pt-6`}>
          <ArticleHeader post={post} category={category} author={author} />
        </div>
      </header>

      <div className={`${ui.container} ${ui.bandPadding}`}>
        <div className="grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="flex min-w-0 max-w-3xl flex-col gap-10">
            {post.takeaways.length > 0 && <KeyTakeaways takeaways={post.takeaways} />}

            <ArticleBody source={post.body} />

            {post.faqs.length > 0 && (
              <section id="faq" className={`${ui.section} mt-6`}>
                <SectionHeader kicker="FAQ" title="Frequently asked questions" />
                <FaqList faqs={post.faqs} />
              </section>
            )}

            {post.sources.length > 0 && <SourceList sources={post.sources} />}

            <AuthorCard author={author} />
          </div>

          <aside className="hidden lg:block" aria-label="Article tools">
            <div className="sticky top-6 flex flex-col gap-4">
              {contents.length > 1 && <TableOfContents headings={contents} />}
              <RailCta kind={post.cta} />
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <div className={ui.band}>
          <div className={`${ui.container} ${ui.bandPadding}`}>
            <section className={ui.section}>
              <SectionHeader kicker="Keep reading" title="Related articles" />
              <PostGrid posts={related} />
            </section>
          </div>
        </div>
      )}

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <CtaPanel kind={post.cta} secondary={{ href: "/pricing-calculator", label: "See pricing" }} />
        </div>
      </div>
    </article>
  );
}
