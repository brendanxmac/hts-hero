import { CheckIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import ButtonCheckout from "@/components/ButtonCheckout";
import config from "@/config";
import { PricingPlan } from "@/types";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { THEME_LIGHT } from "@/components/ui/theme";

// The classification plans, from the same Stripe plan config and checkout buttons as before
// (config.stripe.classifierPlans): Starter and Pro check out through Stripe, Team books a demo.
export const ClassifyPlans = () => (
  <section id="pricing" className={`${mk.band} ${mk.bandMuted} scroll-mt-20`} aria-labelledby="pricing-title">
    <div className={mk.container}>
      <SectionIntro
        title={<>Reduce Import Risk with Classifications you can <span className={mk.accent}>Defend</span></>}
        id="pricing-title"
        center
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3">
        {config.stripe.classifierPlans.map((plan) => {
          const featured = Boolean(plan.isFeatured);
          const custom = plan.planIdentifier === PricingPlan.CLASSIFY_TEAM;
          return (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 ${featured ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" : mk.card}`}
            >
              {featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-teal-400 px-3 py-1 text-xs font-bold text-slate-950">Most Popular</span>
              )}
              <h3 className={`text-xl font-semibold ${featured ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
              <p className={`mt-1 text-sm ${featured ? "text-slate-300" : "text-slate-500"}`}>{plan.description}</p>
              <div className="mt-6">
                {custom ? (
                  <p className="text-3xl font-bold tracking-tight">Custom Pricing</p>
                ) : (
                  <p className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">${plan.prices[0]}</span>
                    {plan.priceAnchors?.[0] && (
                      <span className={`text-lg line-through ${featured ? "text-slate-500" : "text-slate-400"}`}>${plan.priceAnchors[0]}</span>
                    )}
                    <span className={featured ? "text-slate-400" : "text-slate-500"}>/mo</span>
                  </p>
                )}
                {custom && <p className="mt-1 text-sm text-slate-500">Based on Scale</p>}
              </div>
              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f.name} className={`flex gap-2.5 text-sm ${featured ? "text-slate-200" : "text-slate-600"}`}>
                    <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-teal-300" : "text-teal-600"}`} aria-hidden />
                    {f.name}
                  </li>
                ))}
              </ul>
              {/* The shared checkout button is navy; on the dark featured card it takes the teal accent */}
              <div
                className={`${THEME_LIGHT} mt-8 bg-transparent ${
                  featured ? "[&_.btn-primary]:border-teal-400 [&_.btn-primary]:bg-teal-400 [&_.btn-primary]:text-slate-950 [&_.btn-primary:hover]:bg-teal-300" : ""
                }`}
              >
                <ButtonCheckout plan={plan} />
              </div>
            </article>
          );
        })}
      </div>
      <div className={`${mk.card} mx-auto mt-12 flex max-w-4xl flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left`}>
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 ring-1 ring-teal-200">
          <ShieldCheckIcon className="h-8 w-8 text-teal-600" aria-hidden />
        </span>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
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
          <li key={v} className="flex items-center gap-2 text-sm text-slate-600">
            <CheckIcon className="h-4 w-4 text-teal-600" aria-hidden /> {v}
          </li>
        ))}
      </ul>
    </div>
  </section>
);
