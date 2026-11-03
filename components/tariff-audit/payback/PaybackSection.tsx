import { AUDIT_TIERS, formatPrice, monthlyRate } from "@/components/pricing-calculator/lib/pricing";
import { Reveal, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

// "It Pays for Itself", after "Results in Seconds" and right before pricing: a column chart, to
// scale, of a year of the smallest plan next to what one audit could recover. Always "could": a recovery is potential until it's filed
// (savings-are-potential).

const whole = (n: number) => formatPrice(Math.round(n));

// The tallest column's height; the others are drawn to scale against it
const BAR_PX = 300;

// What one audit could recover: the engine's real example ($4,000 overpaid on $40,000 of steel wire)
const ONE_AUDIT = 4_000;

export const PaybackSection = () => {
  const found = ONE_AUDIT;
  const year = monthlyRate(AUDIT_TIERS[0].price, "annual") * 12;
  if (found <= year) return null;
  const px = (n: number) => `${Math.max((n / found) * BAR_PX, 12)}px`;

  const value = "font-bold tabular-nums [font-family:var(--font-tracker-display)]";
  const label = "text-sm font-bold text-base-content [font-family:var(--font-tracker-display)] sm:text-lg";

  return (
    <section id="savings" className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="payback-title">
      <div className={mk.container}>
        <SectionIntro eyebrow="" title={<>It Pays for Itself</>} id="payback-title" center>
          A single audit for one product could cover a whole year of HTS Hero.
        </SectionIntro>

        <Reveal className="mx-auto mt-16 max-w-4xl">
          <figure aria-label={`A year of HTS Hero is ${whole(year)}; one audit could recover ${whole(found)}`}>
            {/* Columns drawn to scale on one baseline, each labelled below */}
            <div className="mx-auto grid max-w-xl grid-cols-2 items-end gap-6 border-b-2 border-base-content/20 px-2 sm:gap-14 sm:px-4">
              <div className="flex flex-col items-center">
                <p className={`${value} text-xl text-base-content sm:text-4xl`}>{whole(year)}</p>
                <div className="mt-3 w-full rounded-t-2xl bg-base-content/40" style={{ height: px(year) }} />
              </div>

              <div className="flex flex-col items-center">
                <p className={`${value} text-2xl text-success sm:text-5xl`}>{whole(found)}</p>
                <div className="mt-3 w-full rounded-t-2xl bg-success shadow-xl shadow-success/20" style={{ height: px(found) }} />
              </div>
            </div>
            <div className="mx-auto grid max-w-xl grid-cols-2 gap-6 px-2 pt-4 text-center sm:gap-14 sm:px-4">
              <p className={label}>A year of HTS Hero</p>
              <p className={label}>What a single audit could recover</p>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
};
