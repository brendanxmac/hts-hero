import Image from "next/image";
import Link from "next/link";
import type { Author } from "@/libs/blog/types";
import * as ui from "@/components/ui/styles";

// Who wrote the post and why they know the subject
export function AuthorCard({ author }: { author: Author }) {
  return (
    <section aria-label="About the author" className={`${ui.card} flex flex-col gap-5 p-5 sm:flex-row sm:p-6`}>
      <Image
        src={author.avatar}
        alt={author.name}
        width={64}
        height={64}
        className="h-16 w-16 shrink-0 rounded-full border border-base-300 object-cover"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <span className={ui.label}>Written by</span>
        <p className="text-lg font-semibold text-base-content">
          <Link href={`/blog/author/${author.slug}`} className="hover:text-primary">
            {author.name}
          </Link>
          <span className="font-medium text-base-content/60"> · {author.role}</span>
        </p>
        <p className={`${ui.body} max-w-prose`}>{author.bio}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href={author.linkedin} target="_blank" rel="noopener me" className={ui.link}>
            Follow on LinkedIn
          </a>
          <Link href={`/blog/author/${author.slug}`} className={ui.link}>
            More from {author.name.split(" ")[0]}
          </Link>
        </div>
      </div>
    </section>
  );
}
