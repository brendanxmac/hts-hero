import Link from "next/link";
import { ArrowRightIcon, ArrowTopRightOnSquareIcon, CheckIcon, MinusIcon } from "@heroicons/react/20/solid";
import type { Tool } from "@/libs/compare/types";
import config from "@/config";
import * as ui from "@/components/ui/styles";

// One tool in a ranked list: its place, what it is, who it suits, what it costs, and its
// strengths and limits. HTS Hero's card carries the main call to action; the rest link to
// their head-to-head comparison and to the tool itself.
export function RankedToolCard({ tool, rank, vsHref }: { tool: Tool; rank: number; vsHref?: string }) {
  const ours = tool.slug === "hts-hero";
  return (
    <article id={tool.slug} className={`${ui.card} scroll-mt-6 ${ours ? "border-primary/40" : ""}`}>
      <div className={`${ui.cardHeader} flex-wrap`}>
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-base font-semibold tabular-nums ${
              ours ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"
            }`}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-xl font-semibold tracking-tight text-base-content">{tool.name}</h3>
            <p className={ui.caption}>{tool.kind}</p>
          </div>
        </div>
        {ours && <span className={ui.badge("primary")}>Best overall for US importers</span>}
      </div>

      <div className="grid gap-6 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <p className={ui.body}>{tool.summary}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className={ui.label}>Strengths</span>
              <ul className="flex flex-col gap-2">
                {tool.strengths.map((s) => (
                  <li key={s} className={`${ui.bodySm} flex items-start gap-2`}>
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <span className={ui.label}>Limitations</span>
              <ul className="flex flex-col gap-2">
                {tool.limitations.map((l) => (
                  <li key={l} className={`${ui.bodySm} flex items-start gap-2`}>
                    <MinusIcon className="mt-0.5 h-4 w-4 shrink-0 text-base-content/60" aria-hidden />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <dl className="flex flex-col gap-4 border-t border-base-300 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex flex-col gap-1">
            <dt className={ui.label}>Price</dt>
            <dd className="text-base font-semibold text-base-content">{tool.price}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className={ui.label}>Best for</dt>
            <dd className={ui.bodySm}>{tool.bestFor}</dd>
          </div>
        </dl>
      </div>

      <div className={`${ui.cardFooter} flex flex-wrap items-center gap-3`}>
        {ours ? (
          <>
            <Link href="/duty-calculator" className={ui.button({ variant: "primary" })}>
              Try HTS Hero free
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/pricing-calculator" className={ui.button()}>
              See pricing
            </Link>
            <a href={config.bookCallUrl} target="_blank" rel="noopener" className={`${ui.link} text-sm`}>
              Talk to us about the API
            </a>
          </>
        ) : (
          <>
            {vsHref && (
              <Link href={vsHref} className={ui.button()}>
                HTS Hero vs {tool.name}
              </Link>
            )}
            <a href={tool.url} target="_blank" rel="noopener nofollow" className={`${ui.link} inline-flex items-center gap-1 text-sm`}>
              Visit {tool.vendor ?? tool.name}
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
            </a>
          </>
        )}
      </div>
    </article>
  );
}
