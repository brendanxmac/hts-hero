import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Reveal, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { CaughtChange } from "../lib/facts";
import { DutyChart } from "./DutyChart";

// Why monitoring matters, told with one real product's duty, beside the latest US tariff changes
export const DutyStory = ({ changes }: { changes: CaughtChange[] }) => (
  <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="story-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Why monitor" title="One product. Three rates. Eleven months." id="story-title">
        The duty on steel hardware from China went from 47.9% to 37.9% to 77.9% since November. Every product you import
        can move like this, and each move changes your landed cost.
      </SectionIntro>

      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Reveal>
          <figure className={`${mk.card} p-6 sm:p-8`}>
            <figcaption className="mb-4">
              <p className="text-lg font-semibold text-slate-900">Duty on steel hardware from China</p>
              <p className={mk.small}>HTS 7326.90.86.88 · total US duty, % of value · HTS Hero tariff engine</p>
            </figcaption>
            <DutyChart />
          </figure>
        </Reveal>

        <div className={`${mk.card} flex flex-col`}>
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-lg font-semibold text-slate-900">The latest US tariff changes</p>
            <p className={mk.small}>Each one alerted every catalog it touched</p>
          </div>
          <ol className="flex-1 divide-y divide-slate-100">
            {changes.map((c) => (
              <li key={c.id} className="px-6 py-4">
                <p className="text-sm font-semibold text-teal-700">
                  {c.date} <span className="font-normal text-slate-400">· {c.revision}</span>
                </p>
                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600">{c.summary}</p>
              </li>
            ))}
          </ol>
          <div className="border-t border-slate-200 px-6 py-4">
            <Link href="/duty-calculator/changelog" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800">
              Every change, in the tariff changelog <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);
