import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import { formatImports, ImportFacts, IMPORT_SOURCE, largestOrdinal } from "@/libs/country-pages/importStats";
import * as tt from "@/components/ui/styles/tracker";

// What the US imports from the page's country, beside the heading: last year's
// total, its rank and share of all US imports (drawn as a bar), and this year so far
export const ImportFactsCard = ({ name, facts }: { name: string; facts: ImportFacts }) => {
  // "3rd-largest source", "Largest source"
  const rank = largestOrdinal(facts.rank2025).replace(/^l/, "L");
  const ytd = facts.ytd;
  const span = ytd ? (ytd.months === 1 ? ytd.through : `Jan to ${ytd.through.replace(/^(\w{3})\w*/, "$1")}`) : "";
  const up = ytd?.changePct !== null && ytd?.changePct !== undefined && ytd.changePct >= 0;

  return (
    <section aria-labelledby="import-facts-title" className={`${tt.panel} w-full p-6`}>
      <h2 id="import-facts-title" className={`${tt.eyebrow()} m-0`}>
        US imports from {name}
      </h2>

      <p className="mt-4 flex items-baseline gap-2">
        <span className={`${tt.display} text-3xl font-semibold tabular-nums tracking-tight text-base-content`}>{formatImports(facts.imports2025)}</span>
        <span className="text-sm text-base-content/60">in 2025</span>
      </p>

      {/* Share of all US goods imports */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-base-content/60">
          <span>{rank} source</span>
          <span className="tabular-nums">{facts.sharePct}% of US imports</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-tt-soft" aria-hidden>
          <div
            className="h-full min-w-[3px] rounded-full bg-primary"
            style={{ width: `${Math.min(facts.sharePct, 100)}%` }}
          />
        </div>
      </div>

      {ytd && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-base-300 pt-4 text-sm">
          <span className="text-base-content/60">
            {span} {ytd.year}
          </span>
          <span className="flex items-center gap-2 tabular-nums">
            <span className="font-semibold text-base-content">{formatImports(ytd.imports)}</span>
            {ytd.changePct !== null && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-success" : "text-error"}`}>
                {up ? <ArrowTrendingUpIcon className="h-4 w-4" aria-hidden /> : <ArrowTrendingDownIcon className="h-4 w-4" aria-hidden />}
                <span className="sr-only">{up ? "up" : "down"}</span>
                {Math.abs(ytd.changePct)}%
                <span className="sr-only"> on the same months of {ytd.year - 1}</span>
              </span>
            )}
          </span>
        </div>
      )}

      <a
        href={IMPORT_SOURCE.url}
        rel="noopener"
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
      >
        Source: US Census Bureau
        <span aria-hidden>→</span>
      </a>
    </section>
  );
};
