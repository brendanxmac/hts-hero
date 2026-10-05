import * as ui from "@/components/ui/styles";
import { TariffFinder } from "../lib/useTariffFinder";
import { EMPTY_STEPS, emptyTitle } from "./emptyStateCopy";
import { ExampleButtons } from "./ExampleButtons";

// In place of the results before a code and country are chosen: what you'll get, and examples
export const EmptyState = ({ f }: { f: TariffFinder }) => (
  <section className={`${ui.card} p-6 sm:p-10 h-full flex flex-col justify-center`}>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10 items-center">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-base-content">
          {emptyTitle(f)}
        </h2>
        <p className={`${ui.body} mt-2`}>
          You&apos;ll get a line-by-line statement: the base rate, every Chapter
          99 tariff and exemption in effect on your entry date, and customs
          fees, each with the reason it applies.
        </p>
        <ol className="mt-6 flex flex-col gap-3">
          {EMPTY_STEPS.map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-3 text-base text-base-content"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold tabular-nums text-primary"
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className={ui.label}>Try an example</div>
        <ExampleButtons onExample={f.selectExample} />
      </div>
    </div>
  </section>
);
