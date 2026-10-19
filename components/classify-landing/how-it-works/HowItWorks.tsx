"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { DocumentTextIcon, ScaleIcon } from "@heroicons/react/24/outline";
import { mono } from "@/components/ui/font";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { PRODUCTS, Product, STEPS } from "../lib/howItWorks";

// How it works, compact: the four steps as a list on the left (advancing on their own until the
// visitor picks one), and one framed panel on the right showing that step for the chosen example
// product. The copy and examples are the original homepage section's.

const ADVANCE_MS = 6000;

const Describe = ({ product }: { product: Product }) => (
  <div className="flex h-full flex-col justify-center rounded-xl border border-base-300 bg-tt-soft px-6 py-8">
    <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Product description</p>
    <p className="mt-3 text-2xl font-bold leading-snug tracking-tight text-base-content">{product.description}</p>
  </div>
);

const Evidence = ({ label, items, Icon }: { label: string; items: readonly string[]; Icon: typeof ScaleIcon }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">{label}</p>
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="inline-flex items-center gap-1 rounded-md bg-tt-soft px-2 py-1 text-xs font-semibold text-base-content/70">
          <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
          {item}
        </span>
      ))}
    </div>
  </div>
);

const Candidates = ({ product }: { product: Product }) => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
    <ul className="flex flex-col gap-2">
      {product.candidates.map((c, i) => {
        const selected = i === product.selectedIndex;
        return (
          <li key={c.code} className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 ${selected ? "border-primary/40 bg-primary/10" : "border-base-300"}`}>
            <span className={`${mono.className} text-base font-bold text-base-content`}>{c.code}</span>
            <span className="line-clamp-2 min-w-0 flex-1 text-xs leading-snug text-base-content/70">{c.title}</span>
            {selected && <CheckIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
          </li>
        );
      })}
    </ul>
    <div className="flex flex-col gap-4">
      <Evidence label="Legal notes" items={product.legalNotes.map((n) => n.source)} Icon={DocumentTextIcon} />
      {product.crossRulings.length > 0 && <Evidence label="CROSS rulings" items={product.crossRulings.map((r) => r.id)} Icon={ScaleIcon} />}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Analysis</p>
        <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-base-content/70">{product.notesWhy}</p>
      </div>
    </div>
  </div>
);

const Select = ({ product }: { product: Product }) => {
  const candidate = product.candidates[product.selectedIndex];
  const [notes, setNotes] = useState<string>(product.summary);
  useEffect(() => setNotes(product.summary), [product.summary]);
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Selected heading</p>
      <p className={`${mono.className} mt-1 text-4xl font-bold text-base-content`}>{candidate.code}</p>
      <p className="mt-1 line-clamp-2 text-sm text-base-content/70">{candidate.title}</p>
      <label htmlFor="classifier-reasoning" className="mt-5 block text-xs font-bold uppercase tracking-wider text-primary">
        Classifier reasoning
      </label>
      <textarea id="classifier-reasoning" value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} className={`${mk.textarea} mt-2 text-sm`} />
    </div>
  );
};

const Repeat = ({ heading }: { heading: string }) => {
  const levels = [
    { label: "4-digits", value: heading, state: "done" },
    { label: "6-digits", value: `${heading}.XX`, state: "next" },
    { label: "8-digits", value: `${heading}.XX.XX`, state: "later" },
    { label: "10-digits", value: `${heading}.XX.XX.XX`, state: "later" },
  ] as const;
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-base leading-relaxed text-base-content/70">Repeat at the next level with fresh legal notes and CROSS ruling research</p>
      <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {levels.map((l) => (
          <li
            key={l.label}
            className={`rounded-xl border px-3 py-3 text-center ${l.state === "done" ? "border-success/40 bg-success/10" : l.state === "next" ? "border-primary/40 bg-primary/10 ring-2 ring-primary" : "border-base-300 bg-tt-soft"
              }`}
          >
            <p className={`text-[11px] font-bold uppercase tracking-wider ${l.state === "done" ? "text-success" : l.state === "next" ? "text-primary" : "text-base-content/60"}`}>
              {l.label}
              {l.state === "next" && " · Next"}
            </p>
            <p className={`${mono.className} mt-1 text-sm font-bold ${l.state === "later" ? "text-base-content/60" : "text-base-content"}`}>{l.value}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export const HowItWorks = () => {
  const [productIndex, setProductIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const product = PRODUCTS[productIndex];

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), ADVANCE_MS);
    return () => clearTimeout(id);
  }, [auto, step]);

  const pick = (i: number) => {
    setAuto(false);
    setStep(i);
  };

  const panel = [
    <Describe key="d" product={product} />,
    <Candidates key="c" product={product} />,
    <Select key="s" product={product} />,
    <Repeat key="r" heading={product.candidates[product.selectedIndex].code} />,
  ][step];

  return (
    <section id="how-it-works" className={`${mk.band} scroll-mt-20`} aria-labelledby="how-title">
      <div className={mk.container}>
        <SectionIntro eyebrow="Four steps" title="How It Works" id="how-title" center>
          From a product description to an evidence-backed classification in minutes.
        </SectionIntro>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-1 lg:flex-nowrap">
              <span className="mr-0.5 shrink-0 text-[11px] font-bold uppercase tracking-wide text-base-content/60">Examples:</span>
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setProductIndex(i)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold transition-colors ${i === productIndex ? "bg-base-content text-base-100" : "bg-base-100 text-base-content/70 ring-1 ring-base-300 hover:text-base-content"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <ol className="flex flex-col gap-2">
              {STEPS.map((s, i) => {
                const active = i === step;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-current={active ? "step" : undefined}
                      className={`relative flex w-full items-start gap-4 overflow-hidden rounded-xl px-4 py-3.5 text-left transition-colors ${active ? "bg-base-100 ring-2 ring-primary" : "hover:bg-base-100/70"
                        }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-primary text-white" : "bg-base-300 text-base-content/70"}`}>
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-base-content">{s.title}</span>
                        <span className="mt-0.5 block text-sm text-base-content/70">{s.description}</span>
                      </span>
                      {active && auto && (
                        // Time left before the next step, as a filling bar
                        <span key={`${step}-${productIndex}`} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary animate-[hiw-fill_6s_linear]" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="overflow-hidden rounded-2xl bg-base-100 ring-1 ring-base-300">
            <div className="flex items-center justify-between border-b border-base-300 bg-tt-soft px-5 py-3">
              <span className="flex items-center gap-2" aria-hidden>
                <span className="h-3 w-3 rounded-full bg-error" />
                <span className="h-3 w-3 rounded-full bg-warning" />
                <span className="h-3 w-3 rounded-full bg-success" />
              </span>
              <span className="text-xs font-semibold text-base-content/60">
                Step {step + 1} · {STEPS[step].title}
              </span>
            </div>
            <div className="min-h-96 p-6" aria-live="polite">
              {panel}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center text-center">
          <a href="#try-classify" className={mk.buttonPrimary}>
            Try it on your product <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </a>
          <p className={`${mk.small} mt-3`}>Results in seconds · No credit card required</p>
        </div>
      </div>
      <style jsx global>{`
        @keyframes hiw-fill {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  );
};
