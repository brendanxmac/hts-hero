import { HeroClassifyInput } from "@/components/HeroClassifyInput";
import * as mk from "@/components/ui/marketing/styles";

// The original homepage hero, word for word, in the marketing theme: the trust line, the promise
// and the real classification input (anonymous visitors get a few free classifications, then are
// asked to sign up). id="try-classify" is where "Try it on your product" links land.
export const ClassifyHero = () => (
  <header id="try-classify" className={`relative overflow-hidden scroll-mt-20 ${mk.bandTint}`}>
    <div className={`${mk.container} flex flex-col items-center pb-20 pt-14 text-center lg:pt-20`}>
      <p className={mk.eyebrow}>Classification Assistant</p>
      <h1 className={`${mk.display} mt-5 max-w-4xl`}>
        Produce Audit-Ready Classifications in <span className={mk.accent}>Minutes</span>
      </h1>
      <p className={`${mk.lead} mx-auto mt-6 max-w-2xl`}>
        Quickly find candidates, eliminate blind spots, and back every code with legal notes and CROSS rulings.
      </p>
      <div className="mt-10 w-full max-w-4xl text-left">
        <HeroClassifyInput />
      </div>
      <p className="mt-8 inline-flex items-center gap-2 text-sm text-base-content/60">
        <span className="tracking-widest text-warning" aria-hidden>
          ★★★★★
        </span>
        Trusted by <strong className="font-semibold text-base-content">300+</strong> customs brokers &amp; importers
      </p>
    </div>
  </header>
);
