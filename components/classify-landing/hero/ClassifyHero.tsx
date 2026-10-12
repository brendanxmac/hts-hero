import { HeroClassifyInput } from "@/components/HeroClassifyInput";
import * as mk from "@/components/ui/marketing/styles";
import { THEME_LIGHT } from "@/components/ui/theme";

// The original homepage hero, word for word, in the marketing theme: the trust line, the promise
// and the real classification input (anonymous visitors get a few free classifications, then are
// asked to sign up). id="try-classify" is where "Try it on your product" links land.
export const ClassifyHero = () => (
  <header id="try-classify" className={`relative overflow-hidden scroll-mt-20 ${mk.bandTint}`}>
    <div className={`${mk.container} flex flex-col items-center pb-20 pt-14 text-center lg:pt-20`}>
      <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 md:text-base">
        <span className="text-amber-400">★</span>
        Trusted by <strong className="text-teal-700">300+</strong> Customs Brokers &amp; Importers
        <span className="text-amber-400">★</span>
      </p>
      <h1 className={`${mk.display} mt-8 max-w-4xl`}>
        Produce Audit-Ready Classifications in{" "}
        <span className="relative isolate whitespace-nowrap text-teal-600">
          Minutes
          <span aria-hidden className="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-teal-200/70" />
        </span>
      </h1>
      <p className={`${mk.lead} mx-auto mt-6 max-w-2xl`}>
        Quickly find candidates, eliminate blind spots, and back every code with legal notes and CROSS rulings.
      </p>
      <div className={`${THEME_LIGHT} mt-10 w-full max-w-4xl rounded-2xl bg-white p-6 text-left shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200 sm:p-8`}>
        <HeroClassifyInput />
      </div>
    </div>
  </header>
);
