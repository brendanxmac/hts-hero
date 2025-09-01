"use client";

import { useState } from "react";
import apiClient from "@/libs/api";
import { PricingPlan, PricingPlanI } from "../types";
import { useUser } from "../contexts/UserContext";
import {
  fetchPurchasesForUser,
  getProductForPlan,
  userHasActivePurchaseForProduct,
} from "../libs/supabase/purchase";
import toast from "react-hot-toast";

interface Props {
  plan: PricingPlanI;
  currentPlan?: PricingPlan;
}

const getBuyButtonText = (plan: PricingPlanI) => {
  switch (plan.planIdentifier) {
    case PricingPlan.TARIFF_IMPACT_STARTER:
      return `Try Now!`;
    case PricingPlan.TARIFF_IMPACT_STANDARD:
      return `Get Standard!`;
    case PricingPlan.CLASSIFY_PRO:
    case PricingPlan.TARIFF_IMPACT_PRO:
      return `Go ${plan.name}!`;
    default:
      return "Buy Now!";
  }
};

// This component is used to create Stripe Checkout Sessions
// It calls the /api/stripe/create-checkout route with the priceId, successUrl and cancelUrl
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
// You can also change the mode to "subscription" if you want to create a subscription instead of a one-time payment
const ButtonCheckout = ({ plan, currentPlan }: Props) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getCheckoutSuccessEndpoint = (plan: PricingPlan) => {
    switch (plan) {
      case PricingPlan.CLASSIFY_PRO:
        return "/app";
      case PricingPlan.TARIFF_IMPACT_STANDARD:
      case PricingPlan.TARIFF_IMPACT_PRO:
        return "/tariffs/impact-checker";
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);

    // Check if user has an active purchase
    const product = getProductForPlan(plan.planIdentifier);
    const userAlreadyHasAccess =
      user && (await userHasActivePurchaseForProduct(user.id, product));

    const userAttemptingUpgradeFromStandardToPro =
      plan.planIdentifier === PricingPlan.TARIFF_IMPACT_PRO &&
      currentPlan === PricingPlan.TARIFF_IMPACT_STANDARD;

    if (userAlreadyHasAccess && !userAttemptingUpgradeFromStandardToPro) {
      toast.success("You already have an active purchase");
      setIsLoading(false);
      return;
    }

    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          itemId: plan.planIdentifier,
          successEndpoint: getCheckoutSuccessEndpoint(plan.planIdentifier),
          cancelUrl: window.location.href.includes("#")
            ? window.location.href
            : window.location.href + "#pricing",
        }
      );

      window.location.href = url;
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  return (
    <button
      className="btn bg-primary/80 hover:bg-white hover:text-primary text-white rounded-md btn-block group"
      onClick={() => handlePayment()}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
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
      )}
      {getBuyButtonText(plan)}
    </button>
  );
};

export default ButtonCheckout;
