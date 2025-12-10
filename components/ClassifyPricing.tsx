import config from "@/config";
import { classNames } from "../utilities/style";
import { PricingFeatureI } from "../types";
import ButtonCheckout from "./ButtonCheckout";
import { AboutPage } from "../enums/classify";
import { StripePaymentMode } from "../libs/stripe";
import { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

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
      className="w-[18px] h-[18px] text-primary shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const getPricingPlans = (customerType: AboutPage) => {
  if (customerType === AboutPage.CLASSIFIER) {
    return config.stripe.classifierPlans;
  }

  return [];
};

const getPricingHeadline = () => {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 md:my-2">
      <div className="flex flex-col gap-1">
        <h2 className="font-black text-3xl md:text-4xl lg:text-5xl max-w-5xl mx-auto md:[&>span]:inline-block md:[&>span]:mb-2">
          <span className="underline decoration-primary">Smarter</span>{" "}
          Classifications,{" "}
          <span className="underline decoration-primary">Effortless</span>{" "}
          Tariffs
        </h2>
      </div>
    </div>
  );
};

const ClassifyPricing = ({ customerType }: PricingProps) => {
  // Track the selected price tier index for each plan
  const [selectedTierIndices, setSelectedTierIndices] = useState<{
    [key: number]: number;
  }>({});

  const handleTierChange = (planIndex: number, tierIndex: number) => {
    setSelectedTierIndices((prev) => ({
      ...prev,
      [planIndex]: tierIndex,
    }));
  };

  return (
    <section className="bg-gradient-to-t from-primary/70 via-primary/10 to-transparent overflow-hidden">
      <div className="py-16 px-8 max-w-7xl mx-auto" id="pricing">
        <div className="flex flex-col text-center w-full">
          <p className="font-medium text-base-content mb-4">Pricing</p>
          {getPricingHeadline()}
        </div>
        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8 text-base-content mt-10">
          {getPricingPlans(customerType).map((plan, index) => {
            const defaultTierIndex = plan.prices.length - 1;
            const currentTierIndex =
              selectedTierIndices[index] ?? defaultTierIndex;
            const currentPrice = plan.prices[currentTierIndex];
            const currentPriceAnchor = plan.priceAnchors?.[currentTierIndex];
            const hasMultipleTiers =
              plan.prices.length > 1 &&
              plan.priceTiers &&
              plan.priceTiers.length > 1;

            return (
              <div
                key={index}
                className={classNames(
                  "relative w-full max-w-lg border-2 border-base-content/10 rounded-lg shadow-md",
                  plan.isFeatured && "border-primary rounded-lg"
                  // !plan.isFeatured &&
                  //   "border-2 border-base-content/20 rounded-lg"
                )}
              >
                {plan.isFeatured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <span
                      className={`badge text-xs text-base-100 font-semibold border-0 bg-primary`}
                    >
                      Best Value
                    </span>
                  </div>
                )}

                <div
                  className={`relative flex flex-col h-full gap-4 lg:gap-6 bg-base-100 p-6 rounded-lg ${
                    plan.isCompetitor && "bg-red-500/20"
                  }`}
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex flex-col">
                      <p className="text-2xl font-bold">
                        {plan.planIdentifier}
                      </p>

                      {plan.description && (
                        <p className="text-base-content/80">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-end gap-4">
                    <div className="flex gap-2 items-center">
                      {currentPriceAnchor && (
                        <div className="flex flex-col justify-end mb-[4px] text-lg ">
                          <p className="text-xs text-base-content/40">USD</p>
                          <p className="relative">
                            <span className="absolute bg-neutral-500 h-[2px] inset-x-0 top-[45%]"></span>
                            <span className="text-base-content/50 text-xl font-bold">
                              ${currentPriceAnchor}
                            </span>
                          </p>
                        </div>
                      )}
                      {currentPrice === 0 ? (
                        <p className={`text-4xl tracking-tight font-extrabold`}>
                          Free
                        </p>
                      ) : (
                        <div className="flex items-end">
                          <p
                            className={`${plan.isCompetitor ? "text-error" : "text-base-content"} text-5xl tracking-tight font-extrabold`}
                          >
                            ${currentPrice}
                          </p>
                          {plan.mode === StripePaymentMode.SUBSCRIPTION && (
                            <div className="flex flex-col">
                              <p className="pl-1 pb-1 text-sm text-base-content/80 font-semibold">
                                / user / month
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {hasMultipleTiers && (
                      <select
                        value={currentTierIndex}
                        onChange={(e) =>
                          handleTierChange(index, parseInt(e.target.value))
                        }
                        className="select select-bordered select-sm bg-base-100 text-base-content font-semibold"
                      >
                        {plan.priceTiers!.map((tier, i) => (
                          <option key={i} value={i}>
                            {tier}
                          </option>
                        ))}
                      </select>
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
                                <span className="bg-base-200 px-2 py-1 rounded-md text-base-content/70 font-semibold text-xs">
                                  {getFeatureSupportingLabel(feature)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-base-content/60">
                              {feature.details}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!plan.isCompetitor && (
                    <div className="space-y-2">
                      <ButtonCheckout plan={plan} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-2 justify-center text-center items-center p-4 max-w-4xl mx-auto bg-base-100 rounded-full border-2 border-base-content/10">
          <div className="flex gap-2 items-center">
            <ShieldCheckIcon className="w-6 h-6 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-primary">
              Smarter Classifications Guarantee
            </h3>
          </div>
          <p className="font-medium text-sm sm:text-base">
            Get a full refund if you complete 20 classifications and are
            unsatisfied with your purchase after 30 days!
          </p>
        </div>
      </div>
    </section>
  );
};

export default ClassifyPricing;
