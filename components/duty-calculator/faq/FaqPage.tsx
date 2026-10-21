import Link from "next/link";
import { ArrowRightIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import * as mk from "@/components/ui/marketing/styles";
import type { FaqSection } from "../guide/faqs";

// /duty-calculator/faq: every question about the calculator, in sections, with a rail of links
// to each section. Server-rendered, so crawlers and AI answers read every answer. The text
// matches the page's FAQPage schema exactly.
export function FaqPage({ sections }: { sections: FaqSection[] }) {
  const count = sections.reduce((n, s) => n + s.faqs.length, 0);
  return (
    <>
      <header className={`${mk.bandTint} relative overflow-hidden`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_24rem_at_85%_-10%,rgba(45,212,191,0.18),transparent)]"
        />
        <div className={`${mk.container} relative flex flex-col gap-8 pb-16 pt-8 sm:pb-24`}>
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <Link href="/duty-calculator" className="font-medium text-slate-600 underline-offset-4 hover:text-teal-700 hover:underline">
              Duty Calculator
            </Link>
            <span aria-hidden="true" className="mx-1.5 text-slate-400">/</span>
            <span className="text-slate-900" aria-current="page">FAQ</span>
          </nav>
          <div className="flex max-w-4xl flex-col gap-4 sm:pt-6">
            <span className={mk.eyebrow}>{count} questions answered</span>
            <h1 className={mk.display}>US Tariff Calculator FAQ</h1>
            <p className={`${mk.lead} mt-2 max-w-3xl`}>
              How the calculator works, what&apos;s behind every rate, how the 2026 tariffs combine, and what the total does
              and doesn&apos;t include.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/duty-calculator" className={mk.buttonPrimary}>
                Calculate a duty
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/duty-calculator/changelog" className={mk.buttonSecondary}>
                See the changelog
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className={`${mk.container} py-16 sm:py-20`}>
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="FAQ sections" className="hidden lg:block">
            <div className={`${mk.card} sticky top-24 p-2`}>
              <span className="block px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Sections</span>
              <ul>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-teal-700"
                    >
                      {s.title}
                      <span className="flex items-center gap-1 text-xs tabular-nums text-slate-400">
                        {s.faqs.length}
                        <ChevronRightIcon className="h-4 w-4 group-hover:text-teal-600" aria-hidden />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="flex min-w-0 max-w-4xl flex-col gap-20">
            {sections.map((s, si) => (
              <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-8">
                <div className="flex max-w-3xl flex-col gap-3">
                  <span className={mk.eyebrow}>{`${s.faqs.length} questions`}</span>
                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl sm:leading-10">{s.title}</h2>
                  {s.description && <p className={mk.lead}>{s.description}</p>}
                </div>
                <div className="flex flex-col gap-3">
                  {s.faqs.map(({ question, answer }, i) => (
                    <details key={question} open={si === 0 && i === 0} className={`${mk.card} group`}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                        <h3 className="text-lg font-semibold text-slate-900">{question}</h3>
                        <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
                      </summary>
                      <p className={`${mk.body} px-6 pb-6`}>{answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <section className="relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-[#0b1220] p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(32rem_16rem_at_90%_0%,rgba(45,212,191,0.2),transparent)]"
              />
              <div className="relative flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Still have a question?</h2>
                <p className="text-base leading-relaxed text-slate-300">
                  Email{" "}
                  <a
                    href={`mailto:${config.resend.supportEmail}`}
                    className="wrap-break-word font-semibold text-teal-300 underline decoration-teal-300/40 decoration-2 underline-offset-4 hover:decoration-teal-300"
                  >
                    {config.resend.supportEmail}
                  </a>
                  , or book a call about integrations, the API or larger plans.
                </p>
              </div>
              <a href={config.bookCallUrl} target="_blank" rel="noopener" className={`${mk.buttonOnDark} relative shrink-0`}>
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
