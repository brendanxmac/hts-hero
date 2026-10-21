import { CheckIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { AuditRequestForm } from "./AuditRequestForm";

const WHAT_YOU_GET = [
  "A review of your entries against the rules on each entry date",
  "Overpaid and underpaid duty, line by line, with the reason",
  "Which refund routes apply and their deadlines",
  "A report your customs broker can file from",
];

// "Have us do it": what the requested audit includes, beside the form
export const RequestAudit = () => (
  <section id="request" className={`${mk.band} scroll-mt-6`} aria-labelledby="request-title">
    <div className={`${mk.container} grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
      <div className="lg:sticky lg:top-8 lg:self-start">
        <SectionIntro eyebrow="Request an audit" title="Have us audit your entries" id="request-title">
          Tell us about your company and we&apos;ll review your entries and send you a report of what you may be able to recover.
          Free, with no obligation.
        </SectionIntro>
        <ul className="mt-8 flex flex-col gap-3">
          {WHAT_YOU_GET.map((item) => (
            <li key={item} className="flex gap-3 text-base text-base-content/70">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                <CheckIcon className="h-4 w-4 text-primary" aria-hidden />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <AuditRequestForm />
    </div>
  </section>
);
