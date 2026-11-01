import Link from "next/link";
import { ArrowRightIcon, BellAlertIcon, CalculatorIcon, CheckIcon, ListBulletIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { EntryCta } from "@/components/onboarding/EntryCta";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

// What costs nothing, before any plan: the two big free reasons to come in (the calculator with no
// account, unlimited tracking with one), then what else a free account gets.

const BIG = [
  {
    Icon: CalculatorIcon,
    title: "Duty Calculator",
    tag: "No account needed",
    body: "The full US duty on any HTS code from any country, as often as you like.",
    points: ["Every tariff itemized, with its legal source", "Section 232, 301 and trade programs", "Every fee and exemption, line by line"],
  },
  {
    Icon: ListBulletIcon,
    title: "Tariff Tracking for Your Products",
    tag: "Free account",
    body: "Add your whole catalog and keep it, with no limit on products and no time limit.",
    points: ["Current duty and every tariff on each product", "Rate history, and exports to CSV or Excel", "A heads-up when a new tariff action hits your products"],
  },
];

const MORE = [
  { Icon: SparklesIcon, title: "The Plain-English Why", body: "Why each tariff applies, and why others don't, with the legal text." },
  { Icon: CheckIcon, title: "AD/CVD Check", body: "The antidumping and countervailing cases that may cover any product." },
  { Icon: BellAlertIcon, title: "Tariff News", body: "An email on every new US tariff action, from every official source." },
];

export const FreeBand = () => (
  <section id="free" className={`${mk.band} scroll-mt-16`} aria-labelledby="free-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Free" title="Free for as Long as You Like" id="free-title" center>
        No trial clock and no credit card required on any of this.
      </SectionIntro>

      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {BIG.map(({ Icon, title, tag, body, points }, i) => (
          <article key={title} className="flex flex-col rounded-3xl bg-tt-soft p-8 ring-1 ring-base-content/15 transition-all hover:-translate-y-1 hover:shadow-2xl hover:ring-primary/50">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="text-right text-5xl font-bold tracking-tight text-base-content [font-family:var(--font-tracker-display)]">$0</span>
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">{title}</h3>
            <p className="mt-1 text-sm font-semibold text-success">{tag}</p>
            <p className={`${mk.body} mt-3`}>{body}</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {points.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm text-base-content/80">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              {i === 0 ? (
                <Link href="/duty-calculator" className={`${mk.buttonSecondary} group w-full`}>
                  Look Up a Duty <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ) : (
                <EntryCta page="pricing" entry="pricing_page" section="free_tracking" label="Track My Products Free" className={`${mk.buttonSecondary} group w-full`}>
                  Track My Products Free <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </EntryCta>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {MORE.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-3xl p-6 ring-1 ring-base-content/10">
            <Icon className="h-5 w-5 text-primary" aria-hidden />
            <h3 className="mt-3 font-semibold text-base-content [font-family:var(--font-tracker-display)]">{title}</h3>
            <p className={`${mk.small} mt-1`}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
