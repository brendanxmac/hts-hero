import config from "@/config";
import { classNames } from "../utilities/style";
import { PricingFeatureI } from "../types";
import ButtonCheckout from "./ButtonCheckout";
import { AboutPage } from "../enums/classify";
import { StripePaymentMode } from "../libs/stripe";
import { useState } from "react";
import {
  ShieldCheckIcon,
  CheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

interface PricingProps {
  customerType: AboutPage;
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

  return <CheckIcon className="w-5 h-5 text-secondary shrink-0" />;
};

const getPricingPlans = (customerType: AboutPage) => {
  if (customerType === AboutPage.CLASSIFIER) {
    return config.stripe.classifierPlans;
  }

  return [];
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
    <section className="relative overflow-hidden bg-base-100 border-t border-base-content/5">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-secondary/5 to-transparent rounded-full blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div
        className="relative z-10 py-20 md:py-28 px-6 max-w-6xl mx-auto"
        id="pricing"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-px bg-secondary/40" />
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Pricing
            </span>
            <span className="w-8 h-px bg-secondary/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 max-w-3xl mx-auto">
            <span className="bg-gradient-to-r from-secondary via-secondary to-primary bg-clip-text text-transparent">
              Save Hours
            </span>{" "}
            on Classifications, and{" "}
            <span className="bg-gradient-to-r from-secondary via-secondary to-primary bg-clip-text text-transparent">
              Insantly See
            </span>{" "}
            the Tariffs & Duties for Any Import
          </h2>
          <p className="text-base-content/60 text-base md:text-lg max-w-2xl mx-auto">
            Everything you need to streamline HTS classifications
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8 max-w-4xl mx-auto">
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
            const isTeamPlan = plan.planIdentifier
              .toLowerCase()
              .includes("team");

            return (
              <div
                key={index}
                className={classNames(
                  "group relative w-full max-w-md overflow-hidden",
                  "bg-gradient-to-br from-base-200/80 via-base-100 to-base-200/60",
                  "backdrop-blur-sm rounded-2xl border transition-all duration-300",
                  plan.isFeatured
                    ? "border-secondary/40 shadow-xl shadow-secondary/10 hover:shadow-2xl hover:shadow-secondary/20"
                    : "border-base-content/10 shadow-lg hover:shadow-xl hover:border-secondary/20"
                )}
              >
                {/* Featured badge */}
                {plan.isFeatured && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-secondary to-primary rounded-b-xl text-white text-xs font-semibold shadow-lg">
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Best Value
                    </div>
                  </div>
                )}

                {/* Decorative gradient orb */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-8 flex flex-col h-full">
                  {/* Plan header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={classNames(
                          "flex items-center justify-center w-10 h-10 rounded-xl",
                          plan.isFeatured
                            ? "bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/20"
                            : "bg-base-200 border border-base-content/10"
                        )}
                      >
                        {isTeamPlan ? (
                          <UserGroupIcon
                            className={classNames(
                              "w-5 h-5",
                              plan.isFeatured
                                ? "text-secondary"
                                : "text-base-content/70"
                            )}
                          />
                        ) : (
                          <SparklesIcon
                            className={classNames(
                              "w-5 h-5",
                              plan.isFeatured
                                ? "text-secondary"
                                : "text-base-content/70"
                            )}
                          />
                        )}
                      </div>
                      <div className="w-full flex justify-between items-center">
                        <h3 className="text-xl font-bold text-base-content">
                          {plan.planIdentifier}
                        </h3>
                        {/* Tier selector - inline with price */}
                        {hasMultipleTiers && (
                          <select
                            value={currentTierIndex}
                            onChange={(e) =>
                              handleTierChange(index, parseInt(e.target.value))
                            }
                            className="select select-sm ml-auto bg-base-200/50 text-base-content text-xs font-medium border border-base-content/10 focus:border-secondary focus:outline-none"
                          >
                            {plan.priceTiers!.map((tier, i) => (
                              <option key={i} value={i}>
                                {tier}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-base-content/60">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-6">
                    {currentPriceAnchor && (
                      <div className="flex flex-col">
                        <span className="relative text-2xl font-bold text-base-content/40">
                          <span className="absolute inset-0 flex items-center">
                            <span className="w-full h-0.5 bg-base-content/30" />
                          </span>
                          ${currentPriceAnchor}
                        </span>
                      </div>
                    )}
                    {currentPrice === 0 ? (
                      <span className="text-5xl font-extrabold text-base-content">
                        Free
                      </span>
                    ) : (
                      <>
                        <span
                          className={classNames(
                            "text-5xl font-extrabold tracking-tight",
                            plan.isFeatured
                              ? "bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent"
                              : "text-base-content"
                          )}
                        >
                          ${currentPrice}
                        </span>
                        {plan.mode === StripePaymentMode.SUBSCRIPTION && (
                          <span className="text-base-content/50 text-sm font-medium">
                            / user / month
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent mb-6" />

                  {/* Features */}
                  {plan.features && (
                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div
                            className={classNames(
                              "flex items-center justify-center w-5 h-5 rounded-full mt-0.5 shrink-0",
                              plan.isFeatured
                                ? "bg-secondary/10"
                                : "bg-base-200"
                            )}
                          >
                            {getFeatureIcon(feature)}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-base-content">
                                {feature.name}
                              </span>
                              {(feature.comingSoon || feature.roadmap) && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-base-200 text-base-content/60">
                                  {getFeatureSupportingLabel(feature)}
                                </span>
                              )}
                            </div>
                            {feature.details && (
                              <p className="text-xs text-base-content/50 mt-0.5">
                                {feature.details}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA - always at bottom */}
                  {!plan.isCompetitor && (
                    <div className="mt-auto pt-4">
                      <ButtonCheckout plan={plan} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-secondary/5 via-base-100 to-primary/5 rounded-2xl border border-secondary/20 p-8 md:p-10">
            {/* Decorative elements */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />

            <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/20 shrink-0">
                <ShieldCheckIcon className="w-8 h-8 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-base-content mb-2">
                  Smarter Classifications{" "}
                  <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    Guarantee
                  </span>
                </h3>
                <p className="text-base-content/60 text-sm md:text-base leading-relaxed">
                  Complete 20 classifications within 30 days. If you&apos;re not
                  completely satisfied with your experience, we&apos;ll refund
                  your purchase in full.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional value props */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-10 text-center">
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <CheckIcon className="w-4 h-4 text-secondary" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <CheckIcon className="w-4 h-4 text-primary" />
            <span>Request Features</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <CheckIcon className="w-4 h-4 text-secondary" />
            <span>In-App Support</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <CheckIcon className="w-4 h-4 text-secondary" />
            <span>Video Tutorials</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassifyPricing;
