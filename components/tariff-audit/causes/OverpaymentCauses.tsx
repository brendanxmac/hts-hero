import { ArrowPathIcon, CheckBadgeIcon, NoSymbolIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { CAUSES } from "../lib/copy";

// One icon and tint per cause, in CAUSES order
const LOOK = [
  { Icon: Square3Stack3DIcon, tint: "bg-warning/10 text-warning" },
  { Icon: CheckBadgeIcon, tint: "bg-success/10 text-success" },
  { Icon: ArrowPathIcon, tint: "bg-warning/10 text-warning" },
  { Icon: NoSymbolIcon, tint: "bg-error/10 text-error" },
];

export const OverpaymentCauses = () => (
  <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="causes-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Why importers overpay" title="Four ways duty gets overpaid" id="causes-title" center>
        The HTS has been revised dozens of times since the start of 2025, and every change has its own exemptions, stacking
        rules and dates. These are the overpayments an audit finds most.
      </SectionIntro>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {CAUSES.map((c, i) => {
          const { Icon, tint } = LOOK[i % LOOK.length];
          return (
            <article key={c.title} className={`${mk.card} flex flex-col gap-4 p-7`}>
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className={mk.h3}>{c.title}</h3>
              <p className={mk.body}>{c.text}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);
