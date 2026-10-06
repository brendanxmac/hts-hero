import Link from "next/link";
import { categoryBySlug } from "@/libs/blog/catalog";
import type { PostMeta } from "@/libs/blog/types";
import * as ui from "@/components/ui/styles";
import { formatPostDate } from "../lib/format";

// A post in a grid: category, title, summary and date. The whole card is the link.
export function PostCard({ post, showCategory = true }: { post: PostMeta; showCategory?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`${ui.card} group flex h-full flex-col gap-3 p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
    >
      {showCategory && <span className={ui.kicker}>{categoryBySlug(post.category)?.title}</span>}
      <h3 className="text-lg font-semibold leading-snug tracking-tight text-base-content group-hover:text-primary">
        {post.title}
      </h3>
      <p className={`${ui.bodySm} line-clamp-3`}>{post.description}</p>
      <p className={`${ui.caption} mt-auto pt-2`}>
        <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt, "short")}</time> · {post.readingMinutes} min read
      </p>
    </Link>
  );
}
