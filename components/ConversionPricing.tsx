import config from "@/config";
import { classNames } from "../utilities/style";
import { PricingType } from "../types";
import ButtonCheckout from "./ButtonCheckout";
import { CustomerType } from "../enums/classify";
import { TertiaryText } from "./TertiaryText";
import Link from "next/link";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

interface Props {
  customerType: CustomerType;
}

const getPricingPlans = (customerType: CustomerType) => {
  if (customerType === CustomerType.IMPORTER) {
    return config.stripe.importerPlans;
  }
  return config.stripe.classifierPlans;
};

const Pricing = ({ customerType }: Props) => {
  return (
    <section className="bg-neutral-900 overflow-hidden" id="pricing">
      <div className="py-16 px-8 max-w-7xl mx-auto flex flex-col items-center justify-center">
        {/* <div className="mb-10 flex flex-col gap-2 items-center border-2 border-neutral-content/20 rounded-lg p-4">
          <TertiaryLabel value="🎁 Your HTS Code:" />
          <h2 className="text-3xl md:text-4xl text-secondary font-extrabold select-none text-center">
            xxxx.xx.xx.xx
          </h2>
          <div className="flex items-center justify-center gap-1 w-full animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-neutral-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>

            <p className="text-center text-sm text-neutral-300 tracking-tight">
              HTS Code Hidden, Get Access Below
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-neutral-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>
          </div>
        </div> */}

        {/* <div className="flex gap-2 items-center">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold">
            Your HTS Code is:
          </h1>
          <div className="bg-white rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 w-full animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-4 h-4 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                />
              </svg>

              <p className="text-center font-bold text-sm text-secondary tracking-tight">
                HTS Code Hidden, Get Access Below
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-4 h-4 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                />
              </svg>
            </div>
          </div>
        </div> */}

        <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-extrabold">
          Get Your HTS Code <span className="text-primary">in Seconds</span>
          {/* Type Description, Get Code */}
          {/* Your Code Awaits! */}
          {/* Almost There! */}
          {/* Your HTS Code is Waiting! */}
        </h1>
        {/* <div className="mt-4 w-full max-w-xs bg-secondary rounded-lg p-2 backdrop-blur-sm">
          <div className="bg-white rounded-lg px-2 py-4">
            <div className="flex items-center justify-center gap-1 w-full animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-4 h-4 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                />
              </svg>

              <p className="text-center font-bold text-sm text-secondary tracking-tight">
                Code Hidden, Waiting for Payment
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-4 h-4 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                />
              </svg>
            </div>
          </div>
        </div> */}

        <h2 className="m-5 mb-2 max-w-4xl text-lg sm:text-xl md:text-2xl text-primary font-extrabold text-center">
          Select a pass to unlock full access to Code Finder:
          {/* Select a pass to complete your classification */}
        </h2>
        {/* <div className=" flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 xl:grid-cols-2 lg:gap-20">
            <ul className="w-full xl:flex xl:flex-col xl:gap-5">
              {classifyFeatures.map((feature, i) => (
                <AccordionItem
                  key={feature.title}
                  index={i}
                  features={classifyFeatures}
                  feature={feature}
                  isOpen={featureSelected === i}
                  setFeatureSelected={() => setFeatureSelected(i)}
                />
              ))}
            </ul>

            <div className="w-full h-fit justify-center self-center hidden xl:flex">
              <Media
                feature={classifyFeatures[featureSelected]}
                key={featureSelected}
              />
            </div>
          </div>
        </div> */}
        <p className="mb-8 text-lg md:text-xl font-bold text-secondary">
          ⚡️ 50% off until July!
        </p>
        {/* <p className="mb-6 text-sm font-semibold text-white">
          🚀 Launch Deal:{" "}
          <span className="text-accent">50% off until July!</span>
        </p> */}

        <div className="w-full relative flex justify-evenly flex-col lg:flex-row items-center lg:items-stretch gap-8 text-white">
          {getPricingPlans(customerType).map((plan, index) => (
            <div
              key={index}
              className={classNames(
                "relative w-full max-w-lg",
                plan.isFeatured && "border-2 border-primary rounded-lg",
                !plan.isFeatured && "border-2 border-base-content/20 rounded-lg"
              )}
            >
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge text-xs text-black font-semibold border-0 bg-primary`}
                  >
                    BEST VALUE
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                ></div>
              )}

              <div
                className={`relative flex flex-col h-full gap-4 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg ${
                  plan.isCompetitor && "bg-red-500/20"
                }`}
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    {/* <div className="flex mb-4 gap-2">
                      <span className="font-extrabold text-lg">
                        {plan.isCompetitor
                          ? "Manual Classifier"
                          : config.appName}
                      </span>
                    </div> */}

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
                    <p className={`text-4xl tracking-tight font-extrabold`}>
                      Free
                    </p>
                  ) : (
                    <div className="flex items-end">
                      <p
                        className={`${plan.isCompetitor ? "text-red-600" : "text-white"} text-5xl text-base-content tracking-tight font-extrabold`}
                      >
                        ${plan.price}
                      </p>
                      <p className="pl-1 pb-1 text-sm text-white font-bold">
                        {plan.type === PricingType.SUBSCRIPTION
                          ? "/ month"
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
                {plan.features && (
                  <ul className="space-y-4 leading-relaxed text-base flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {feature.comingSoon ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-[21px] h-[21px] opacity-80"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                        ) : (
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
                        )}

                        <div className="flex flex-col -mt-1">
                          <div
                            className={classNames(
                              "flex items-center gap-2",
                              feature.comingSoon && "mb-1"
                            )}
                          >
                            <p>{feature.name} </p>
                            {feature.comingSoon && (
                              <span className="bg-neutral-700 px-2 py-1 rounded-md text-stone-300 font-semibold text-xs">
                                Coming Soon
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
                    <ButtonCheckout itemId={plan.name} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <TertiaryText value="One-time purchase. No Subscriptions. Instant access." />
        </div>

        <Link
          href="/about/importer"
          className="mt-2 text-base-content/80 text-sm hover:underline"
        >
          Learn More
        </Link>

        {/* {customerType === "importer" && (
          <div className="mt-16 flex flex-col gap-2 justify-center items-center">
            <div className="flex gap-1 items-center">
              <ShieldCheckIcon className="w-6 h-6 text-secondary" />
              <h3 className="text-lg font-extrabold text-secondary">
                Customs Code Approval Guarantee
              </h3>
            </div>
            <p className="text-white">
              We guarantee codes that customs will accept or you get a full
              refund!
            </p>
            <p className="text-sm text-base-content/80">
              <sup>
                See{" "}
                <Link href="/terms" className="hover:underline">
                  terms and conditions
                </Link>
              </sup>{" "}
            </p>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default Pricing;
