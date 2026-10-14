import { Reveal, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { STEPS } from "../lib/copy";
import { EngineSchematic } from "./EngineSchematic";

// How it works: the engine diagram, then the three steps to get started
export const EngineSection = () => (
  <section id="how-it-works" className={`${mk.band} relative scroll-mt-6 overflow-hidden`} aria-labelledby="engine-title">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(oklch(var(--b3))_1px,transparent_1px),linear-gradient(90deg,oklch(var(--b3))_1px,transparent_1px)] [background-size:32px_32px]"
    />
    <div className={`${mk.container} relative`}>
      <SectionIntro eyebrow="How it works" title={<>Engineered to get every duty <span className={mk.accent}>exactly right.</span></>} id="engine-title" center>
        Four official sources and every Chapter 99 stacking rule, run against each product you import. When a change hits,
        you see which products, by how much, and why.
      </SectionIntro>
      <Reveal className="mx-auto mt-14 max-w-5xl">
        <div className={`${mk.card} p-6 sm:p-10`}>
          <EngineSchematic />
        </div>
      </Reveal>
      <ol className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-content text-base font-bold text-base-100" aria-hidden>
              {i + 1}
            </span>
            <div>
              <h3 className={mk.h3}>{step.title}</h3>
              <p className={`${mk.body} mt-1`}>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
