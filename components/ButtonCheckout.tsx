"use client";

import { useState } from "react";
import apiClient from "@/libs/api";
import { PricingPlan } from "../types";
import { useUser } from "../contexts/UserContext";
import { userHasActivePurchase } from "../libs/supabase/purchase";
import toast from "react-hot-toast";

interface Props {
  itemId: PricingPlan;
}

const getBuyButtonText = (plan: PricingPlan) => {
  if (plan === PricingPlan.ONE_DAY_PASS) {
    return "Get 1-Day Pass";
  }

  if (plan === PricingPlan.FIVE_DAY_PASS) {
    return "Get 5-Day Pass";
  }

  if (plan === PricingPlan.PRO) {
    return `Go ${plan}!`;
  }

  if (plan === PricingPlan.PREMIUM) {
    return `Get ${plan}!`;
  }

  return "Buy Now!";
};

// This component is used to create Stripe Checkout Sessions
// It calls the /api/stripe/create-checkout route with the priceId, successUrl and cancelUrl
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
// You can also change the mode to "subscription" if you want to create a subscription instead of a one-time payment
const ButtonCheckout = ({ itemId }: Props) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePayment = async () => {
    setIsLoading(true);

    // Check if user has an active purchase
    const userAlreadyHasAccess = user && (await userHasActivePurchase(user.id));

    if (userAlreadyHasAccess) {
      toast.success("You already have an active purchase");
      setIsLoading(false);
      return;
    }

    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          itemId,
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
      {getBuyButtonText(itemId)}
    </button>
  );
};

export default ButtonCheckout;
