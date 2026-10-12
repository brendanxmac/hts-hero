import { Reveal, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { STEPS } from "../lib/copy";
import { AuditFlowDiagram } from "./AuditFlowDiagram";

// From entry data to a refund list: the audit's flow, then the three steps
export const AuditFlow = () => (
  <section id="how-it-works" className={`${mk.band} relative scroll-mt-6 overflow-hidden`} aria-labelledby="flow-title">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] [background-size:32px_32px]"
    />
    <div className={`${mk.container} relative`}>
      <SectionIntro eyebrow="From entries to refunds" title={<>Every line checked. <span className={mk.accent}>Every dollar found.</span></>} id="flow-title" center>
        No consultants and no contingency fee. Upload your entries, see every line checked, and hand your broker a list
        they can file from.
      </SectionIntro>
      <Reveal className="mx-auto mt-14 max-w-5xl">
        <div className={`${mk.card} p-6 sm:p-10`}>
          <AuditFlowDiagram />
        </div>
      </Reveal>
      <ol className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white" aria-hidden>
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
