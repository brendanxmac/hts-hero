import config from "@/config";
import { classNames } from "../utilities/style";
import ButtonCheckout from "./ButtonCheckout";
import { StripePaymentMode } from "../libs/stripe";
import { getFeatureIcon, getFeatureSupportingLabel } from "./Pricing";
import router from "next/router";
import { useUser } from "../contexts/UserContext";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

// interface Props {
//   customerType: AboutPage;
// }

const ConversionPricing = () => {
  const { user } = useUser();

  return (
    <section className="bg-base-300 overflow-hidden" id="pricing">
      <div className="py-12 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center">
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

        <h1 className="text-white text-3xl md:text-4xl font-extrabold text-center">
          {/* The <span className="text-primary">Classification Assistant</span>
          <br /> for Customs Brokers */}
          Upgrade to <span className="text-primary">Pro</span> to Access
          Classify
        </h1>

        <div className="flex flex-col justify-center items-center py-6">
          <p className="text-xl font-bold text-primary">
            25% Off Your First Month!
          </p>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5 animate-pulse text-secondary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>

            <p className="text-sm text-secondary font-semibold">
              Offer valid until <span className="underline">September 1st</span>
            </p>
          </div>
        </div>

        <div className="w-full relative flex justify-evenly flex-col lg:flex-row items-center lg:items-stretch gap-8 text-white">
          {config.stripe.conversionPlans.map((plan, index) => (
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
                    Limited Time Offer
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <p className="text-2xl font-bold">{plan.name}</p>
                    {plan.description && (
                      <p className="text-base-content/80">{plan.description}</p>
                    )}
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
                          {plan.mode === StripePaymentMode.SUBSCRIPTION
                            ? "/ month"
                            : ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {plan.features && (
                  <ul className="space-y-4 leading-relaxed text-base flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {getFeatureIcon(feature)}
                        <div className="flex flex-col -mt-1">
                          <div
                            className={classNames(
                              "flex items-center justify-between gap-2 w-full",
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
                    <ButtonCheckout itemId={plan.name} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add a button to go to sign in page */}
        {!user && (
          <div className="mt-8 text-sm">
            Already Purchased?{" "}
            <button
              className="hover:underline"
              onClick={() => router.push("/signin")}
            >
              Sign In
            </button>
          </div>
        )}

        {/* <div className="mt-4">
          <TertiaryText value="One-time purchase. No Subscriptions. Instant access." />
        </div> */}

        {/* <Link
          href="/about/importer"
          className="mt-2 text-base-content/80 text-sm hover:underline"
        >
          Learn More
        </Link> */}

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

export default ConversionPricing;
