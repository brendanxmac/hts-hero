import config from "@/config";
import { classNames } from "../utilities/style";
import { PricingFeatureI, PricingPlan } from "../types";
import ButtonCheckout from "./ButtonCheckout";
import { AboutPage } from "../enums/classify";
import { StripePaymentMode } from "../libs/stripe";
import Link from "next/link";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

interface PricingProps {
  customerType: AboutPage;
  // setBuyAttempt?: (buyAttempt: BuyAttempt) => void;
  // setShowItsFree?: (show: boolean) => void;
}

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {/* <h2 className="text-white font-bold text-3xl sm:text-4xl md:text-6xl max-w-6xl mx-auto tracking-relaxed">
          Get Instant <span className="text-primary">Clarity</span> on Tariff
          Changes
        </h2> */}
        {/* <h2 className="text-white font-bold text-3xl sm:text-4xl md:text-6xl max-w-6xl mx-auto tracking-relaxed">
          Manage Tariff Changes On{" "}
          <span className="text-primary">Auto-Pilot</span>
        </h2> */}
        <h2 className="text-white font-extrabold text-3xl sm:text-4xl md:text-6xl max-w-6xl mx-auto tracking-relaxed">
          <span className="text-primary">Automate</span> Tariff Impact Checks
        </h2>
        {/* <h2 className="text-white font-extrabold text-3xl sm:text-4xl md:text-6xl max-w-6xl mx-auto tracking-relaxed">
          Tariff Impact Checks on{" "}
          <span className="text-primary">Auto-Pilot</span>
        </h2> */}
        {/* <p className="font-medium lg:text-lg">
          So you can take early action & save your bottom line
        </p> */}
        <p className="text-sm md:text-lg text-neutral-300 font-medium mt-2">
          Join the forward-thinking importers & brokerages who are automating
          their tariff impact checks
        </p>
      </div>
      {/* <div className="flex flex-col justify-center items-center">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-8 animate-pulse text-secondary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          <p className="text-xl lg:text-2xl font-bold text-secondary">
            50% Off Until October 1st!
          </p>
        </div>
      </div> */}
    </div>
  );
};

const TariffImpactPricing = () => {
  return (
    <section className="bg-base-300 overflow-hidden" id="pricing">
      <div className="py-16 px-8 max-w-7xl mx-auto">
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
                    {/* {plan.name === PricingPlan.PREMIUM && (
                      <span className="mb-4 w-fit bg-neutral-700 px-2 py-1 rounded-md text-stone-300 font-semibold">
                        Coming Soon
                      </span>
                    )} */}
                    <p className="text-2xl font-bold">{plan.name}</p>

                    {/* {plan.description && (
                      <p className="text-base-content/80">{plan.description}</p>
                    )} */}
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
                {!plan.isCompetitor && plan.name !== PricingPlan.PREMIUM && (
                  <div className="space-y-2">
                    {plan.name === PricingPlan.FREE_TRIAL ? (
                      <Link
                        href="/signin"
                        className="btn bg-primary/80 hover:bg-white hover:text-primary text-white rounded-md btn-block group"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5 fill-white group-hover:fill-primary group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                          />
                        </svg>
                        Start Free Trial
                      </Link>
                    ) : (
                      <ButtonCheckout itemId={plan.name} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Plan -- aka lets talk */}
        {/* <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 w-full max-w-3xl mx-auto border-2 border-base-content/20 rounded-lg mt-4 p-6">
          <div className="flex flex-col">
            <p className="text-2xl text-white font-bold">Enterprise</p>
            <p className="text-base-content/80">
              Want the Impact Checker for your whole team?
            </p>
          </div>
          <button className="btn btn-primary md:btn-wide w-full">
            Lets Talk!
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default TariffImpactPricing;
