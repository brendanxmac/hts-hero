"use client";

import { useState } from "react";
import apiClient from "@/libs/api";
import { PricingPlan, PricingPlanI } from "../types";
import { useUser } from "../contexts/UserContext";
import {
  getProductForPlan,
  userHasActivePurchaseForProduct,
} from "../libs/supabase/purchase";
import toast from "react-hot-toast";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import LetsTalkModal from "./LetsTalkModal";
import LightningSVG from "./svg/LightningSVG";

interface Props {
  plan: PricingPlanI;
  currentPlan?: PricingPlan;
}

const getBuyButtonText = (plan: PricingPlanI) => {
  switch (plan.planIdentifier) {
    case PricingPlan.TARIFF_IMPACT_STARTER:
      return `Launch App!`;
    case PricingPlan.TARIFF_IMPACT_STANDARD:
      return `Get Standard!`;
    case PricingPlan.PRO:
    case PricingPlan.CLASSIFY_PRO:
    case PricingPlan.TARIFF_IMPACT_PRO:
      return `Go ${plan.name}!`;
    case PricingPlan.CLASSIFY_TEAM:
    case PricingPlan.PRO_TEAM:
      return "Book Demo";
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const getCheckoutSuccessEndpoint = (plan: PricingPlan) => {
    switch (plan) {
      case PricingPlan.CLASSIFY_PRO:
      case PricingPlan.PRO:
        return "/classifications";
      case PricingPlan.TARIFF_IMPACT_STANDARD:
      case PricingPlan.TARIFF_IMPACT_PRO:
        return "/tariffs/duty-calculator";
    }
  };

  const logCheckoutAttempt = () => {
    try {
      switch (plan.planIdentifier) {
        case PricingPlan.TARIFF_IMPACT_STANDARD:
          trackEvent(MixpanelEvent.INITIATED_IMPACT_STANDARD_CHECKOUT);
          break;
        case PricingPlan.TARIFF_IMPACT_PRO:
          trackEvent(MixpanelEvent.INITIATED_IMPACT_PRO_CHECKOUT);
          break;
        case PricingPlan.CLASSIFY_PRO:
          trackEvent(MixpanelEvent.INITIATED_CLASSIFY_PRO_CHECKOUT);
        case PricingPlan.PRO:
          trackEvent(MixpanelEvent.INITIATED_PRO_CHECKOUT);
          break;
        case PricingPlan.PRO_TEAM:
          trackEvent(MixpanelEvent.INITIATED_PRO_TEAM_CHECKOUT);
          break;
      }
    } catch (e) {
      console.error("Error tracking checkout");
      console.error(e);
    }
  };

  const handleTeamClick = async (plan: PricingPlanI) => {
    const userEmail = user?.email || "";
    const userName = user?.user_metadata?.full_name || "";

    // Track the event
    try {
      const event =
        plan.planIdentifier === PricingPlan.CLASSIFY_TEAM
          ? MixpanelEvent.CLICKED_CLASSIFY_TEAM_LETS_TALK
          : MixpanelEvent.CLICKED_TARIFF_TEAM_LETS_TALK;
      trackEvent(event, {
        userEmail,
        userName,
        isLoggedIn: !!user,
      });
    } catch (e) {
      console.error("Error tracking classify team click:", e);
    }

    // Open the modal
    setIsModalOpen(true);
  };

  const handlePayment = async () => {
    try {
      if (
        plan.planIdentifier === PricingPlan.CLASSIFY_TEAM ||
        plan.planIdentifier === PricingPlan.PRO_TEAM
      ) {
        await handleTeamClick(plan);
        return;
      }

      if (plan.planIdentifier === PricingPlan.TARIFF_IMPACT_STARTER) {
        window.location.href = "/tariffs/impact-checker";
        return;
      }

      setIsLoading(true);
      // Check if user has an active purchase
      const product = getProductForPlan(plan.planIdentifier);
      const hasActiveProductSubscription =
        user && (await userHasActivePurchaseForProduct(user.id, product));

      const userAttemptingUpgrade =
        plan.planIdentifier === PricingPlan.TARIFF_IMPACT_PRO &&
        currentPlan === PricingPlan.TARIFF_IMPACT_STANDARD;

      if (!hasActiveProductSubscription) {
        // Send them to checkout page
        const { url }: { url: string } = await apiClient.post(
          "/stripe/create-checkout",
          {
            itemId: plan.planIdentifier,
            successEndpoint: getCheckoutSuccessEndpoint(plan.planIdentifier),
            cancelUrl: window.location.href.includes("#")
              ? window.location.href.split("#")[0] + "#pricing"
              : window.location.href,
          }
        );

        window.location.href = url;
      } else if (hasActiveProductSubscription && !userAttemptingUpgrade) {
        toast.success(
          "You already have an active purchase. Go to Profile > Billing to manage your purchases"
        );
        setIsLoading(false);
      } else if (hasActiveProductSubscription && userAttemptingUpgrade) {
        const { url }: { url: string } = await apiClient.post(
          "/stripe/create-portal",
          {
            returnUrl: window.location.href,
          }
        );

        window.location.href = url;
      }

      logCheckoutAttempt();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary rounded-md w-full group"
        onClick={() => handlePayment()}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          plan.planIdentifier !== PricingPlan.CLASSIFY_TEAM && (
            <LightningSVG
              color="base-100"
              size={5}
              viewBox="0 0 24 24"
              fill={true}
            />
          )
        )}
        {getBuyButtonText(plan)}
      </button>

      <LetsTalkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ButtonCheckout;
