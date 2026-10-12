import Link from "next/link";
import { CountUp } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { MonitorFacts } from "../lib/facts";

// How often US tariffs change and how much the Tracker covers, from the tariff engine
export const StatsBand = ({ facts }: { facts: MonitorFacts }) => (
  <section aria-label="Tariff Tracker coverage" className="border-y border-slate-200 bg-white">
    <div className={`${mk.container} grid grid-cols-2 gap-8 py-12 lg:grid-cols-4`}>
      {[
        { to: facts.revisionsThisYear, label: `times the HTS changed in ${facts.year}` },
        { to: facts.chapter99Headings, label: "Chapter 99 tariff headings modeled" },
        { to: facts.countries, label: "countries of origin covered" },
      ].map((s) => (
        <div key={s.label}>
          <p className="text-5xl font-bold tracking-tight text-slate-900">
            <CountUp to={s.to} />
          </p>
          <p className={`${mk.body} mt-1`}>{s.label}</p>
        </div>
      ))}
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{facts.verifiedFrom}</p>
        <p className={`${mk.body} mt-1`}>
          rates verified back to, in the{" "}
          <Link href="/duty-calculator/changelog" className={mk.link}>
            changelog
          </Link>
        </p>
      </div>
    </div>
  </section>
);
