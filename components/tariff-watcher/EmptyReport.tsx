import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { EXAMPLE_LIST } from "./exampleList";

// Before there's anything to show: what the watcher does, and the list format
export const EmptyReport = ({ hasText, onExample }: { hasText: boolean; onExample: () => void }) => (
  <section className={`${ui.card} p-6 sm:p-10`}>
    <div className="grid grid-cols-1 items-center gap-8 xl:grid-cols-2 xl:gap-10">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-base-content">
          {hasText ? "None of these lines could be read yet" : "See the tariff rate for every product you import"}
        </h2>
        <p className={`${ui.body} mt-2`}>
          Add your HTS codes and countries of origin, one pair per line. You&apos;ll get each product&apos;s total duty
          rate, the tariffs that make it up, and anything that could lower it.
        </p>
        <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} mt-6`} onClick={onExample}>
          Try an example list
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="rounded-lg border border-base-300 bg-base-200 p-5">
        <div className={ui.label}>Format</div>
        <pre className={`${mono.className} mt-3 text-sm leading-loose text-base-content`}>{EXAMPLE_LIST}</pre>
        <p className="mt-3 text-xs leading-snug text-base-content/60">
          8 or 10 digits, with or without dots. The country is its two-letter code or its name.
        </p>
      </div>
    </div>
  </section>
);
