import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import type { Source } from "@/libs/blog/types";
import * as ui from "@/components/ui/styles";

// The primary sources behind a post: the HTS, the Federal Register, CBP notices
export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <section id="sources" aria-labelledby="sources-title" className={`${ui.card} scroll-mt-6`}>
      <div className={ui.cardHeader}>
        <div>
          <h2 id="sources-title" className={ui.cardTitle}>
            Sources
          </h2>
          <p className={ui.caption}>The official documents this article is based on</p>
        </div>
      </div>
      <ol className="flex list-decimal flex-col gap-2 py-4 pl-10 pr-5 marker:text-sm marker:text-base-content/60">
        {sources.map((source) => (
          <li key={source.url} className="pl-1 text-sm">
            <a href={source.url} target="_blank" rel="noopener" className={ui.link}>
              {source.title}
              <ArrowTopRightOnSquareIcon className="ml-1 inline h-3.5 w-3.5 align-baseline" aria-hidden />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
