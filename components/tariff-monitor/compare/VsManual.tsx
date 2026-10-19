import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { COMPARISON_COLUMNS, COMPARISON_ROWS } from "../lib/copy";

const NO = new Set(["No", "No, every notice", "No, every message"]);

// The Tracker against the usual ways importers keep up with tariff changes
export const VsManual = () => (
  <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="compare-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Compared" title="Tariff Tracker vs. keeping up by hand" id="compare-title">
        The official notices are free, but they cover every product in the country. Turning them into the duty on your
        products is the work the Tracker does for you.
      </SectionIntro>
      <div className={`${mk.card} mt-12 overflow-x-auto`}>
        <table className="w-full min-w-3xl text-left">
          <thead>
            <tr className="border-b border-base-300">
              <th className="px-6 py-5">
                <span className="sr-only">Feature</span>
              </th>
              {COMPARISON_COLUMNS.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`px-5 py-5 text-sm font-semibold ${i === 0 ? "hts-tracker-on-dark rounded-t-xl bg-base-200 text-base-content" : "text-base-content/60"}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, r) => (
              <tr key={row.label} className="border-b border-base-300 last:border-0">
                <th scope="row" className="px-6 py-4 text-sm font-semibold text-base-content">
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={i}
                    className={`px-5 py-4 text-sm ${i === 0 ? `hts-tracker-on-dark bg-base-200 font-semibold text-base-content ${r === COMPARISON_ROWS.length - 1 ? "rounded-b-xl" : ""}` : "text-base-content/70"}`}
                  >
                    <span className="inline-flex items-start gap-1.5">
                      {i === 0 && row.win && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />}
                      {i > 0 && NO.has(value) && <XMarkIcon className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-hidden />}
                      {value}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
