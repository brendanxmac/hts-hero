import Link from "next/link";
import { getPosts } from "@/libs/blog/posts";
import { HtsRevisions } from "@/tariffs/engine-v2/revisions";
import * as ui from "@/components/ui/styles";
import { formatPostDate } from "../lib/format";

// Every revision of this year's HTS: when it was in force and our post about it. Change counts
// are left out on purpose: many changes are retroactive or start before the revision that
// publishes them, so counting by date credits the wrong revision. In MDX: <RevisionTable />
export function RevisionTable({ year = 2026 }: { year?: number }) {
  const revisions = HtsRevisions.filter((r) => r.name.startsWith(`${year}HTS`)).reverse();
  const posts = new Map(getPosts().filter((p) => p.revision).map((p) => [p.revision, p]));
  const revisionNumber = (name: string) => Number(name.match(/Rev(\d+)$/)?.[1] ?? 0);

  return (
    <div className={ui.card}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-base-200">
            <tr>
              <th scope="col" className={`${ui.label} px-4 py-3 pl-5 text-left`}>Revision</th>
              <th scope="col" className={`${ui.label} px-4 py-3 text-left`}>In force</th>
              <th scope="col" className={`${ui.label} px-4 py-3 pr-5 text-left`}>What changed</th>
            </tr>
          </thead>
          <tbody>
            {revisions.map((r) => {
              const post = posts.get(revisionNumber(r.name));
              return (
                <tr key={r.name} className="border-t border-base-300 hover:bg-base-200/60">
                  <th scope="row" className="whitespace-nowrap px-4 py-3 pl-5 text-left font-medium text-base-content">
                    {r.title}
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-base-content/70">
                    {formatPostDate(r.from, "short")} to {r.to ? formatPostDate(r.to, "short") : "today"}
                  </td>
                  <td className="px-4 py-3 pr-5">
                    {post ? (
                      <Link href={`/blog/${post.slug}`} className={ui.link}>
                        {post.title.replace(/^[^:]+:\s*/, "")}
                      </Link>
                    ) : (
                      <span className="text-base-content/60">No post yet</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`${ui.cardFooter} ${ui.caption}`}>
        Dates are when each revision was in force. Changes inside a revision can take effect earlier or later; each post
        gives the exact dates.
      </p>
    </div>
  );
}
