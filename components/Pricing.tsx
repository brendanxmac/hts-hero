import config from "@/config";
import { classNames } from "../utilities/style";
import { RegistrationTrigger } from "../libs/early-registration";
import FakeButtonCheckout from "./FakeButtonCheckout";
import { PricingPlan } from "../types";
// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

interface PricingProps {
  setIsRegisterOpen: (isOpen: boolean) => void;
  setRegistrationTrigger: (trigger: RegistrationTrigger) => void;
}

const Pricing = ({
  setIsRegisterOpen,
  setRegistrationTrigger,
}: PricingProps) => {
  return (
    <section className="bg-neutral-900 overflow-hidden" id="pricing">
      <div className="py-16 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <p className="font-medium text-[#40C969] mb-8">Pricing</p>
          <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl max-w-3xl mx-auto tracking-relaxed">
            Save hours on classification,
            <br /> for less than your daily coffee
          </h2>
        </div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {config.stripe.plans.map((plan) => (
            <div
              key={plan.priceId}
              className={classNames(
                "relative w-full max-w-lg",
                plan.isFeatured && "border-2 border-[#40C969] rounded-lg"
              )}
            >
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge text-xs text-black font-semibold border-0 bg-[#40C969]`}
                  >
                    SAVE 25%
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                ></div>
              )}

              <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-lg lg:text-xl font-bold">{plan.name}</p>
                    {plan.description && (
                      <p className="text-base-content/80 mt-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {plan.priceAnchor && (
                    <div className="flex flex-col justify-end mb-[4px] text-lg ">
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
                    <>
                      <p
                        className={`text-5xl text-base-content tracking-tight font-extrabold`}
                      >
                        ${plan.price}
                      </p>
                      <div className="flex flex-col justify-center pt-1 mb-[4px]">
                        <p className="text-xs text-base-content/40">USD</p>
                        <p className="text-sm text-base-content font-bold">
                          per month
                        </p>
                      </div>
                    </>
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
                              <span className="bg-neutral-800 px-2 py-1 rounded-md text-stone-300 font-semibold text-xs">
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
                <div className="space-y-2">
                  {/* TODO: Enable this in the future before go live*/}
                  {/* <ButtonCheckout priceId={plan.priceId} mode="subscription" /> */}
                  <FakeButtonCheckout
                    text={
                      plan.name === PricingPlan.Starter
                        ? "Try Now"
                        : plan.name === PricingPlan.Standard
                        ? "Get Standard"
                        : "Go Pro"
                    }
                    onClick={() => {
                      const trigger =
                        plan.name === PricingPlan.Starter
                          ? RegistrationTrigger.starter
                          : plan.name === PricingPlan.Standard
                          ? RegistrationTrigger.standard
                          : RegistrationTrigger.pro;

                      setIsRegisterOpen(true);
                      setRegistrationTrigger(trigger);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
