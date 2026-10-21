import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as ui from "./styles";

// A page's questions as one panel of disclosures, divided by rules. Keep the text identical
// to the page's FAQPage schema: search engines require the schema to match what's visible.
// Inside the Tariff Tracker's look (.hts-tracker) it's a round panel with roomier rows.
export function FaqList({
  faqs,
  openFirst = false,
}: {
  faqs: { question: string; answer: string }[];
  openFirst?: boolean;
}) {
  return (
    <div className={`${ui.card} divide-y divide-base-300 tracker:rounded-3xl tracker:shadow-none`}>
      {faqs.map(({ question, answer }, i) => (
        <details key={question} open={openFirst && i === 0} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-base-content hover:bg-base-200/50 tracker:px-7 tracker:py-5 hover:tracker:bg-tt-soft [&::-webkit-details-marker]:hidden">
            <h3>{question}</h3>
            <ChevronDownIcon
              className="h-5 w-5 shrink-0 text-base-content/60 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className={`${ui.body} max-w-prose px-5 pb-5 tracker:px-7 tracker:pb-6`}>{answer}</p>
        </details>
      ))}
    </div>
  );
}
