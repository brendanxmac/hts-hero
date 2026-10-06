import Image from "next/image";
import Link from "next/link";
import type { Author, Category, PostMeta } from "@/libs/blog/types";
import * as ui from "@/components/ui/styles";
import { formatPostDate } from "../lib/format";
import { BlogBreadcrumbs } from "./BlogBreadcrumbs";

// The top of a post: where it sits, its title and lead, and who wrote it when
export function ArticleHeader({ post, category, author }: { post: PostMeta; category: Category; author: Author }) {
  const updated = post.updatedAt !== post.publishedAt;
  return (
    <div className="flex flex-col gap-6">
      <BlogBreadcrumbs
        trail={[
          { href: "/blog", label: "Blog" },
          { href: `/blog/category/${category.slug}`, label: category.title },
          { label: post.title },
        ]}
      />
      <div className="flex max-w-4xl flex-col gap-4">
        <Link href={`/blog/category/${category.slug}`} className={`${ui.kicker} w-fit hover:underline`}>
          {category.title}
        </Link>
        <h1 className={ui.pageTitle}>{post.title}</h1>
        <p className={`${ui.lead} max-w-3xl`}>{post.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={`/blog/author/${author.slug}`} className="group flex items-center gap-3">
          <Image
            src={author.avatar}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-base-300 object-cover"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-base-content group-hover:text-primary">{author.name}</span>
            <span className={ui.caption}>{author.role}</span>
          </span>
        </Link>
        <dl className={`${ui.caption} flex flex-wrap items-center gap-x-4 gap-y-1`}>
          <div className="flex gap-1">
            <dt>{updated ? "Updated" : "Published"}</dt>
            <dd>
              <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
            </dd>
          </div>
          <div className="flex gap-1">
            <dt className="sr-only">Reading time</dt>
            <dd>{post.readingMinutes} min read</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
