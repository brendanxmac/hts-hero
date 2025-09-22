import config from "@/config";
import { classNames } from "../utilities/style";
import { PricingFeatureI, PricingPlan } from "../types";
import ButtonCheckout from "./ButtonCheckout";
import { StripePaymentMode } from "../libs/stripe";
import { useUser } from "../contexts/UserContext";
import { useEffect, useState } from "react";
import { getActivePriorityTariffImpactPurchase } from "../libs/supabase/purchase";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

export const getFeatureSupportingLabel = (feature: PricingFeatureI) => {
  if (feature.comingSoon) {
    return "Coming Soon";
  }
  if (feature.roadmap) {
    return "Roadmap";
  }

  return "";
};

export const getFeatureIcon = (feature: PricingFeatureI) => {
  if (feature.comingSoon) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5 opacity-80"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    );
  }
  if (feature.roadmap) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-5 opacity-80"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-[18px] h-[18px] opacity-80 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const getPricingHeadline = () => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-white font-extrabold text-4xl md:text-6xl max-w-6xl mx-auto tracking-relaxed">
        <span className="text-primary">Save Hours</span> on Tariff Checks & Find
        Ways to <span className="text-primary">Reduce Landed Costs</span>
      </h2>
      <p className="text-sm md:text-lg text-neutral-300 font-medium mt-2">
        Join over 100 importers & customs brokers who are already automating
        their tariff impact checks
      </p>
    </div>
  );
};

const TariffImpactPricing = () => {
  const [currentPlan, setCurrentPlan] = useState<PricingPlan | null>(null);
  const [numberOfImports, setNumberOfImports] = useState(30);
  const { user } = useUser();

  const planDescriptions = {
    starter:
      "Crafted for small importers on a budget who want to know if their imports are affected by new tariffs.",
    standard:
      "Perfect for small businesses managing up to 30 imports who need to know when their imports are affected by new tariffs so they can protect their bottom-line.",
    pro: "Ideal for importers & customs brokers who want their imports tariff optimized & monitored 24/7.",
  };

  const getRecommendedPlan = () => {
    if (numberOfImports <= 5)
      return { name: "Starter", description: planDescriptions.starter };
    if (numberOfImports <= 29)
      return { name: "Standard", description: planDescriptions.standard };
    return { name: "Pro", description: planDescriptions.pro };
  };

  useEffect(() => {
    // Fetch the users current Tariff Impact Plan
    const fetchCurrentTariffImpactPlan = async () => {
      const currentTariffImpactPlan =
        await getActivePriorityTariffImpactPurchase(user.id);
      if (currentTariffImpactPlan) {
        setCurrentPlan(currentTariffImpactPlan.product_name);
      }
    };

    if (user) {
      fetchCurrentTariffImpactPlan();
    }
  }, [user]);

  return (
    <section className="bg-base-300 overflow-hidden" id="pricing">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full my-10">
          <p className="font-medium mb-8">Pricing</p>
          {getPricingHeadline()}
        </div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8 text-white">
          {config.stripe.tariffImpactPlans.map((plan, index) => (
            <div
              key={index}
              className={classNames(
                "relative w-full max-w-xl",
                plan.isFeatured && "border-2 border-primary rounded-lg",
                !plan.isFeatured && "border-2 border-base-content/20 rounded-lg"
              )}
            >
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge text-xs text-black font-semibold border-0 bg-primary`}
                  >
                    Best Value
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                ></div>
              )}

              <div
                className={`relative flex flex-col h-full gap-4 lg:gap-8 z-10 bg-base-300 p-8 rounded-lg ${
                  plan.isCompetitor && "bg-red-500/20"
                }`}
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <p className="text-2xl font-bold">{plan.name}</p>

                    {plan.description && (
                      <p className="text-base-content/80">{plan.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {plan.priceAnchor && (
                    <div className="flex flex-col justify-end mb-[4px] text-lg ">
                      <p className="text-xs text-base-content/40">USD</p>
                      <p className="relative">
                        <span className="absolute bg-neutral-500 h-[2px] inset-x-0 top-[45%]"></span>
                        <span className="text-base-content/50 text-xl font-bold">
                          ${plan.priceAnchor}
                        </span>
                      </p>
                    </div>
                  )}
                  {plan.price === 0 ? (
                    <p
                      className={`text-4xl py-1.5 tracking-tight font-extrabold`}
                    >
                      Free
                    </p>
                  ) : (
                    <div className="flex items-end">
                      <p
                        className={`${plan.isCompetitor ? "text-red-600" : "text-white"} text-5xl text-base-content tracking-tight font-extrabold`}
                      >
                        ${plan.price}
                      </p>
                      {plan.mode === StripePaymentMode.SUBSCRIPTION && (
                        <div className="flex flex-col">
                          <p className="pl-1 pb-1 text-sm text-base-content/80 font-semibold">
                            / month
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {plan.features && (
                  <ul className="space-y-4 leading-relaxed text-base flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {getFeatureIcon(feature)}
                        <div className="flex flex-col -mt-1">
                          <div
                            className={classNames(
                              "flex items-center gap-2 w-full",
                              feature.comingSoon && "mb-1"
                            )}
                          >
                            <p>{feature.name} </p>
                            {(feature.comingSoon || feature.roadmap) && (
                              <span className="bg-neutral-700 px-2 py-1 rounded-md text-stone-300 font-semibold text-xs">
                                {getFeatureSupportingLabel(feature)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {feature.details}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!plan.isCompetitor && (
                  <div className="space-y-2">
                    <ButtonCheckout plan={plan} currentPlan={currentPlan} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Plan -- aka lets talk */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 w-full max-w-xl lg:max-w-7xl mx-auto border-2 border-base-content/20 rounded-lg mt-4 p-6">
          <div className="flex flex-col">
            <p className="text-2xl text-white font-bold">Enterprise</p>
            <p className="text-base-content/80">Get Pro for your whole team</p>
          </div>
          <a
            href="mailto:brendan@htshero.com?subject=Enterprise%20Inquiry%20for%20Tariff%20Impact%20Checker&body=Hi%20Brendan%2C%20I'm%20interested%20in%20getting%20Tariff%20Impact%20Checker%20for%20my%20team"
            className="btn btn-primary md:btn-wide w-full text-white"
          >
            Lets Talk!
          </a>
        </div>

        {/* Interactive Plan Selection Guide */}
        <div className="w-full max-w-7xl mx-auto mt-12 md:mt-24 bg-base-100">
          <div className="border border-base-content/20 rounded-xl bg-gradient-to-br from-base-200/50 to-base-300/50 backdrop-blur-sm p-8">
            <div className="text-center mb-8">
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                Find Your Perfect Plan
              </h3>
              <p className="text-base-content/70 text-sm sm:text-base">
                Tell us about your imports and we&apos;ll recommend the best
                plan for your needs
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              {/* Import Volume Slider */}
              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h4 className="text-sm sm:text-xl font-medium text-white">
                    How many imports do you manage?
                  </h4>
                  <div className="bg-primary/20 border border-primary/50 rounded-lg px-2 sm:px-4 py-1 flex items-center">
                    <span className="text-primary font-bold text:sm sm:text-xl">
                      {numberOfImports > 29
                        ? `${numberOfImports}+`
                        : numberOfImports}
                    </span>
                    <span className="text-white/70 text-sm ml-1">
                      {numberOfImports === 1 ? "import" : "imports"}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={numberOfImports}
                    onChange={(e) => setNumberOfImports(Number(e.target.value))}
                    className="range range-primary w-full range-xs sm:range-sm"
                  />
                  <div className="hidden sm:flex justify-between text-xs text-base-content/50 mt-1">
                    <span>Solo Importer</span>
                    <span>Broker / Importer</span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span>Big Importer / Broker</span>
                  </div>
                </div>
              </div>

              {/* Recommended Plan Display */}
              <div className="w-full max-w-2xl">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      <h5 className="text-lg font-semibold text-white">
                        Recommended Plan:
                      </h5>
                    </div>
                    <div className="badge badge-primary badge-lg text-black font-semibold">
                      {getRecommendedPlan().name}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm sm:text-base text-base-content leading-relaxed">
                      {getRecommendedPlan().description}
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-xs sm:text-sm text-base-content/80 text-center">
                    💡 You can always upgrade or downgrade your plan as your
                    needs change
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TariffImpactPricing;
