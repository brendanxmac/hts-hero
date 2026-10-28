import { AUDIT_TIERS, formatPrice, monthlyRate } from "@/components/pricing-calculator/lib/pricing";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import type { AuditExample } from "@/libs/tariff-audit-example";

// Right before pricing: what one flagged entry (the engine's audit example, also shown in "Paid vs.
// owed") could be worth, against a year of the smallest Tariff Audits plan, billed yearly. Always
// "could": an overpayment is potential until the broker files it (savings-are-potential).

const whole = (n: number) => formatPrice(Math.round(n));

export const PaybackSection = ({ example }: { example: AuditExample | null }) => {
  if (!example) return null;
  const found = example.paidTotal - example.owedTotal;
  const tier = AUDIT_TIERS[0];
  const year = monthlyRate(tier.price, "annual") * 12;
  if (found <= year) return null;
  const times = Math.floor(found / year);

  return (
    <section className={mk.band} aria-labelledby="payback-title">
      <div className={mk.container}>
        <SectionIntro eyebrow="Pays for Itself" title={<>One Audit Can Pay for <span className={mk.accent}>Your Whole Year</span></>} id="payback-title" center>
          A single overpaid entry is often worth more than a year of Tariff Audits.
        </SectionIntro>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* What one flagged entry could be worth */}
          <div className="flex flex-col items-center justify-center rounded-[28px] bg-success/10 p-8 text-center ring-2 ring-success/40">
            <p className="text-sm font-semibold uppercase tracking-wide text-success">One flagged entry</p>
            <p className="mt-3 text-6xl font-bold tracking-tight text-success sm:text-7xl [font-family:var(--font-tracker-display)]">{whole(found)}</p>
            <p className="mt-3 text-base text-base-content/70">
              you could recover on {formatPrice(example.customsValue)} of {example.product.toLowerCase()} from {example.countryName}
            </p>
          </div>

          <p className="flex items-center justify-center text-2xl font-semibold text-base-content/40 [font-family:var(--font-tracker-display)]">vs</p>

          {/* A year of the smallest plan */}
          <div className={`${mk.card} flex flex-col items-center justify-center p-8 text-center`}>
            <p className="text-sm font-semibold uppercase tracking-wide text-base-content/60">A whole year of Tariff Audits</p>
            <p className="mt-3 text-6xl font-bold tracking-tight text-base-content sm:text-7xl [font-family:var(--font-tracker-display)]">{whole(year)}</p>
            <p className="mt-3 text-base text-base-content/70">for up to {tier.maxPairs} imports, billed yearly</p>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">
          That one entry could cover the year {times > 1 ? <span className="text-success">{times} times over</span> : <span className="text-success">on its own</span>}. Anything else it finds is upside.
        </p>
      </div>
    </section>
  );
};
