import { CheckIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import ButtonCheckout from "@/components/ButtonCheckout";
import config from "@/config";
import { PricingPlan } from "@/types";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { PlanCard } from "@/components/pricing-calculator/plans/PlanCard";

// The classification plans, from the same Stripe plan config and checkout buttons as before
// (config.stripe.classifierPlans): Starter and Pro check out through Stripe, Team books a demo.
export const ClassifyPlans = () => (
  <section id="pricing" className={`${mk.band} scroll-mt-20`} aria-labelledby="pricing-title">
    <div className={mk.container}>
      <SectionIntro
        eyebrow="Pricing"
        title={<>Classifications you can <span className={mk.accent}>defend</span></>}
        id="pricing-title"
        center
      >
        Reduce import risk with audit-ready HTS codes, backed by the legal notes and CROSS rulings.
      </SectionIntro>
      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        {config.stripe.classifierPlans.map((plan) => {
          const featured = Boolean(plan.isFeatured);
          const custom = plan.planIdentifier === PricingPlan.CLASSIFY_TEAM;
          return (
            <PlanCard
              key={plan.name}
              name={plan.name}
              description={plan.description}
              badge={featured ? "Most popular" : undefined}
              featured={featured}
              price={
                <div>
                  {custom ? (
                    <p className="text-5xl font-extrabold tracking-tight text-base-content">Custom</p>
                  ) : (
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-6xl font-extrabold tracking-tight tabular-nums text-base-content">${plan.prices[0]}</span>
                      <span className="text-lg text-base-content/60">/mo</span>
                      {plan.priceAnchors?.[0] && (
                        <span className="text-lg tabular-nums text-base-content/50 line-through">
                          <span className="sr-only">was </span>${plan.priceAnchors[0]}
                        </span>
                      )}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-base-content/60">{custom ? "Priced to your volume" : "Billed monthly, cancel any time"}</p>
                </div>
              }
              features={plan.features.map((f) => f.name)}
              cta={
                // The shared Stripe checkout button, restyled to the page's buttons: dark on the
                // featured plan, outlined on the others
                <div
                  className={`[&_.btn]:h-14 [&_.btn]:min-h-0 [&_.btn]:rounded-full [&_.btn]:text-lg [&_.btn]:font-semibold [&_.btn]:normal-case ${
                    featured
                      ? "[&_.btn]:border-base-content [&_.btn]:bg-base-content [&_.btn]:text-base-100 [&_.btn:hover]:bg-base-content/90"
                      : "[&_.btn]:border-base-300 [&_.btn]:bg-base-100 [&_.btn]:text-base-content [&_.btn:hover]:bg-tt-soft [&_svg]:hidden"
                  }`}
                >
                  <ButtonCheckout plan={plan} />
                </div>
              }
            />
          );
        })}
      </div>
      <div className={`${mk.card} mx-auto mt-12 flex max-w-4xl flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left`}>
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <ShieldCheckIcon className="h-8 w-8 text-primary" aria-hidden />
        </span>
        <div>
          <h3 className="text-2xl font-bold text-base-content">
            Smarter Classifications <span className={mk.accent}>Guarantee</span>
          </h3>
          <p className={`${mk.body} mt-2`}>
            If you complete 10 classifications within 30 days, and are not completely satisfied with your experience,
            we&apos;ll refund your purchase in full.
          </p>
        </div>
      </div>
      <ul className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3">
        {["Team Training", "In-App Support", "Video Tutorials", "Cancel Any Time"].map((v) => (
          <li key={v} className="flex items-center gap-2 text-sm text-base-content/70">
            <CheckIcon className="h-4 w-4 text-primary" aria-hidden /> {v}
          </li>
        ))}
      </ul>
    </div>
  </section>
);
