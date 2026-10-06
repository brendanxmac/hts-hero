import Link from "next/link";
import { ArrowRightIcon, ArrowTopRightOnSquareIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import type { FaqSection } from "../guide/faqs";

// /duty-calculator/faq: every question about the calculator, in sections, with a rail of links
// to each section. Server-rendered, so crawlers and AI answers read every answer.
export function FaqPage({ sections }: { sections: FaqSection[] }) {
  const count = sections.reduce((n, s) => n + s.faqs.length, 0);
  return (
    <>
      <header className="w-full border-b border-base-300">
        <div className={`${ui.container} flex flex-col gap-6 pb-10 pt-6`}>
          <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
            <Link href="/duty-calculator" className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
              Duty Calculator
            </Link>
            <span aria-hidden="true" className="mx-1.5">/</span>
            <span className="text-base-content" aria-current="page">FAQ</span>
          </nav>
          <div className="flex max-w-4xl flex-col gap-4">
            <span className={ui.kicker}>{count} questions answered</span>
            <h1 className={ui.display}>US Tariff Calculator FAQ</h1>
            <p className={`${ui.lead} max-w-3xl`}>
              How the calculator works, what&apos;s behind every rate, how the 2026 tariffs combine, and what the total does
              and doesn&apos;t include.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href="/duty-calculator" className={ui.button({ variant: "primary", size: "lg" })}>
                Calculate a duty
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/duty-calculator/changelog" className={ui.button({ size: "lg" })}>
                See the changelog
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className={`${ui.container} ${ui.bandPadding}`}>
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="FAQ sections" className="hidden lg:block">
            <div className={`${ui.card} sticky top-6 p-2`}>
              <span className={`${ui.label} block px-3 pb-1 pt-1.5`}>Sections</span>
              <ul>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-200 hover:text-primary"
                    >
                      {s.title}
                      <span className="flex items-center gap-1 text-xs tabular-nums text-base-content/60">
                        {s.faqs.length}
                        <ChevronRightIcon className="h-4 w-4 group-hover:text-primary" aria-hidden />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="flex min-w-0 max-w-4xl flex-col gap-16">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className={ui.section}>
                <SectionHeader kicker={`${s.faqs.length} questions`} title={s.title}>
                  {s.description}
                </SectionHeader>
                <FaqList faqs={s.faqs} />
              </section>
            ))}

            <section className={`${ui.card} flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8`}>
              <div className="flex flex-col gap-1">
                <h2 className={ui.subsectionTitle}>Still have a question?</h2>
                <p className={ui.body}>
                  Email{" "}
                  <a href={`mailto:${config.resend.supportEmail}`} className={ui.link}>
                    {config.resend.supportEmail}
                  </a>
                  , or book a call about integrations, the API or larger plans.
                </p>
              </div>
              <a href={config.bookCallUrl} target="_blank" rel="noopener" className={`${ui.button({ size: "lg" })} shrink-0`}>
                Book a call
                <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
              </a>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
