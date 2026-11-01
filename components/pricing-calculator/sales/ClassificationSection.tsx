import { ArrowRightIcon, CheckIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { EntryCta } from "@/components/onboarding/EntryCta";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { bookCallHref } from "@/libs/book-call";
import { CLASSIFY_LICENSE_PRICE, CLASSIFY_PLANS, ClassifyPlanId, formatPrice, TEAM_BREAK_EVEN_SEATS } from "../lib/pricing";

// The Classification Assistant's plans, under the FAQ: billed monthly and apart from the tariff offers

const CLASSIFY_ORDER: ClassifyPlanId[] = ["starter", "pro", "team"];

const TEAM_HREF = bookCallHref({ source: "pricing", campaign: "classify-team", context: "Classify Team, from the pricing page (htshero.com/pricing-calculator)" });

const ClassifyCard = ({ id }: { id: ClassifyPlanId }) => {
  const plan = CLASSIFY_PLANS[id];
  const button = "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-content transition-colors hover:bg-primary/90";
  return (
    <article className="flex flex-col rounded-3xl bg-base-100 p-7 ring-1 ring-base-content/15 transition-all hover:-translate-y-1 hover:shadow-2xl hover:ring-primary/50" aria-labelledby={`classify-${id}`}>
      <h4 id={`classify-${id}`}>
        <span className="block text-xs font-bold uppercase tracking-wider text-base-content/55">Classify</span>
        <span className="block text-2xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">{plan.name}</span>
      </h4>
      <p className="mt-6 flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight text-base-content [font-family:var(--font-tracker-display)]">{formatPrice(plan.price)}</span>
        <span className="text-sm font-medium text-base-content/60">/ mo</span>
      </p>
      <p className={`${mk.small} mt-3`}>{plan.description}</p>
      <ul className="mt-6 flex flex-col gap-3 border-t border-base-content/15 pt-6">
        {plan.features.map((text) => (
          <li key={text} className="flex gap-2.5 text-sm text-base-content/80">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        {id === "team" ? (
          <a href={TEAM_HREF} target="_blank" rel="noopener noreferrer" className={button}>
            Book a Demo
          </a>
        ) : (
          <EntryCta page="pricing" entry="classify" section={`classify_${id}`} label="Get Started" className={button}>
            Get Started <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </EntryCta>
        )}
      </div>
    </article>
  );
};

export const ClassificationSection = () => (
  <section id="classification" className={`${mk.band} ${mk.bandMuted} scroll-mt-16`} aria-labelledby="classification-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Classification Assistant" title="Classifications You Can Defend" id="classification-title" center>
        Audit-ready HTS codes, backed by the legal notes and CROSS rulings. Billed monthly.
      </SectionIntro>
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {CLASSIFY_ORDER.map((id) => (
          <ClassifyCard key={id} id={id} />
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-2 rounded-3xl bg-success/10 px-7 py-5 ring-1 ring-success/30 sm:flex-row sm:items-center sm:gap-4">
        <ShieldCheckIcon className="h-6 w-6 shrink-0 text-success" aria-hidden />
        <p className="text-sm leading-relaxed text-base-content/75">
          <span className="font-semibold text-base-content">Smarter Classifications Guarantee.</span> Complete 10 classifications within 30 days and, if you&apos;re not completely satisfied, we&apos;ll refund your purchase in full.
        </p>
      </div>
      <p className={`${mk.small} mt-5 text-center`}>
        Or separate Pro accounts at {formatPrice(CLASSIFY_LICENSE_PRICE)} per person, without the shared workspace. From {TEAM_BREAK_EVEN_SEATS} people, Team costs less.
      </p>
    </div>
  </section>
);
