import { CheckIcon, MinusIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { COMPARE } from "./copy";

// Free, Duty Guard, side by side

const Cell = ({ value }: { value: string | boolean }) =>
  typeof value === "string" ? (
    <span className="text-sm font-semibold text-base-content">{value}</span>
  ) : value ? (
    <CheckIcon className="mx-auto h-5 w-5 text-success" aria-label="Included" />
  ) : (
    <MinusIcon className="mx-auto h-5 w-5 text-base-content/25" aria-label="Not included" />
  );

const HEADS = ["Free", "Duty Guard Essentials", "Duty Guard Pro"];

export const CompareTable = () => (
  <section id="compare" className={`${mk.band} scroll-mt-16`} aria-labelledby="compare-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Compare" title="What You Get With Each Plan" id="compare-title" center />
      <div className="mt-12 overflow-x-auto rounded-3xl ring-1 ring-base-content/15">
        <table className="w-full min-w-160 border-collapse text-left">
          <thead>
            <tr className="bg-tt-soft">
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-base-content/60">
                <span className="sr-only">Feature</span>
              </th>
              {HEADS.map((h, i) => (
                <th key={h} scope="col" className={`w-44 px-4 py-4 text-center font-semibold [font-family:var(--font-tracker-display)] ${i === 2 ? "text-primary" : "text-base-content"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(({ label, free, alerts, audits }) => (
              <tr key={label} className="border-t border-base-content/10">
                <th scope="row" className="px-6 py-3.5 text-sm font-medium text-base-content/80">
                  {label}
                </th>
                {[free, alerts, audits].map((value, i) => (
                  <td key={i} className="px-4 py-3.5 text-center">
                    <Cell value={value} />
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
