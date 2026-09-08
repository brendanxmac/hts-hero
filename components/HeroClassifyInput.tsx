"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useClassification } from "../contexts/ClassificationContext";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import { canCreateClassification } from "../libs/can-create-classification";
import { useUser } from "../contexts/UserContext";
import { NUM_FREE_CLASSIFICATIONS } from "../constants/classification";
import Modal from "./Modal";
import ConversionPricing from "./ConversionPricing";
import { SignUpGateCTA } from "./SignUpGateCTA";
import { PricingPlan } from "../types";
import toast from "react-hot-toast";

const EXAMPLES = [
  "Ceramic brake pads for passenger vehicles, copper-free semi-metallic compound",
  "Stainless steel vacuum insulated water bottle, 32oz with leak-proof lid",
  "Women's 100% cashmere crew-neck pullover sweater, knitted",
  "Lithium-ion battery pack for solar energy storage systems",
  "Men's 100% cotton denim jeans, dyed indigo and pre-washed",
  "Industrial rubber conveyor belt used in mining equipment",
];

const CYCLE_INTERVAL_MS = 4000;
const FADE_DURATION_MS = 320;

export function HeroClassifyInput({
  entryPoint = "home_hero",
}: {
  entryPoint?: string;
}) {
  const exampleIndexRef = useRef(0);
  const [description, setDescription] = useState(EXAMPLES[0]);
  const [isUserEdited, setIsUserEdited] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [isStarterUpsell, setIsStarterUpsell] = useState(false);
  const [currentClassifyPlan, setCurrentClassifyPlan] = useState<
    PricingPlan | undefined
  >();
  const [showSignUpGate, setShowSignUpGate] = useState(false);
  const [signUpGateArticleDescription, setSignUpGateArticleDescription] =
    useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = `hero-product-description-${useId()}`;
  const router = useRouter();
  const { startNewClassification, setArticleDescription } = useClassification();
  const { user } = useUser();

  const isCyclingPaused = isUserEdited || isFocused || isButtonHovered || isCreating;

  useEffect(() => {
    if (isCyclingPaused) {
      setIsVisible(true);
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      return;
    }

    const interval = setInterval(() => {
      setIsVisible(false);
      fadeTimeoutRef.current = setTimeout(() => {
        exampleIndexRef.current =
          (exampleIndexRef.current + 1) % EXAMPLES.length;
        setDescription(EXAMPLES[exampleIndexRef.current]);
        setIsVisible(true);
      }, FADE_DURATION_MS);
    }, CYCLE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    };
  }, [isCyclingPaused]);

  const submitWithDescription = useCallback(
    async (text: string) => {
      if (!text.trim() || isCreating) return;
      setIsCreating(true);

      try {
        const {
          allowed,
          blockReason,
          isPayingUser,
          isOnTeam,
          classificationCount,
          classifyPlan,
        } = await canCreateClassification(user);

        if (!allowed) {
          if (blockReason === "anonymous_limit_reached") {
            setSignUpGateArticleDescription(text.trim());
            setShowSignUpGate(true);
          } else {
            setArticleDescription(text);
            setIsStarterUpsell(blockReason === "starter_limit_reached");
            setCurrentClassifyPlan(classifyPlan ?? undefined);
            setShowPricing(true);
          }
          setIsCreating(false);
          return;
        }

        const newId = await startNewClassification(text, true);

        if (!user) {
          trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
            item: text,
            is_anonymous: true,
            source: "cta",
            entry_point: entryPoint,
          });
          trackEvent(MixpanelEvent.ANONYMOUS_CLASSIFICATION_STARTED, {
            classification_id: newId,
            source: "cta",
            entry_point: entryPoint,
          });
        } else {
          const count = classificationCount ?? 0;
          const isTrialUserWithinLimit =
            !isPayingUser && !isOnTeam && count < NUM_FREE_CLASSIFICATIONS;
          trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
            item: text,
            is_paying_user: isPayingUser,
            is_team_member: isOnTeam,
            is_trial_user: isTrialUserWithinLimit,
            classification_count: count,
            source: "cta",
            entry_point: entryPoint,
          });
        }

        router.push(`/classifications/${newId}`);
      } catch (error) {
        console.error("Error starting classification:", error);
        toast.error(
          "Something went wrong. Please try again or contact support."
        );
        setIsCreating(false);
      }
    },
    [
      isCreating,
      user,
      startNewClassification,
      setArticleDescription,
      router,
      entryPoint,
    ]
  );

  const handleSubmit = () => {
    const text = description.trim();
    if (!text) {
      textareaRef.current?.focus();
      return;
    }
    void submitWithDescription(text);
  };

  const handleChange = (value: string) => {
    setIsUserEdited(true);
    setIsVisible(true);
    setDescription(value);
  };

  const canSubmit = description.trim().length > 0 && !isCreating;

  return (
    <>
      <div className="w-full">
        <div
          className={`relative rounded-xl border-2 bg-base-100/90 backdrop-blur-sm transition-all duration-300 border-base-300 shadow-sm shadow-base-content/10`}
        >
          <div className="relative px-5 pt-5 sm:px-6 sm:pt-6">
            <label
              htmlFor={inputId}
              className="block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45 mb-3"
            >
              Enter Product Description:
            </label>
            <textarea
              id={inputId}
              ref={textareaRef}
              value={description}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canSubmit) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={2}
              className="w-full resize-none bg-transparent text-base sm:text-lg md:text-xl leading-relaxed text-base-content placeholder-base-content/35 focus:outline-none motion-reduce:transition-none text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: `opacity ${FADE_DURATION_MS}ms ease`,
              }}
              placeholder="Describe the product you want to classify"
              aria-label="Product description to classify"
            />
          </div>

        </div>
        <div className="relative px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          <div className="relative">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="group relative w-full overflow-hidden rounded-2xl bg-primary px-6 py-4 sm:py-5 text-base sm:text-lg font-bold text-primary-content transition-all duration-200 hover:bg-primary/90 hover:scale-[1.015] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out" />
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                {isCreating ? (
                  <span className="loading loading-spinner loading-md" />
                ) : (
                  <>
                    <span>Try Now</span>
                    <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </div>
          <p className="mt-3 text-center text-xs sm:text-sm text-base-content/50">
            Results in Seconds · No credit card required
          </p>
        </div>
      </div>

      {showPricing && (
        <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
          <ConversionPricing
            isStarterUpsell={isStarterUpsell}
            currentPlan={currentClassifyPlan}
          />
        </Modal>
      )}
      {showSignUpGate && (
        <Modal isOpen={showSignUpGate} setIsOpen={setShowSignUpGate}>
          <SignUpGateCTA articleDescription={signUpGateArticleDescription} />
        </Modal>
      )}
    </>
  );
}
