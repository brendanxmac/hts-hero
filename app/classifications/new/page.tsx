"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useUser } from "../../../contexts/UserContext";
import { MixpanelEvent, trackEvent } from "../../../libs/mixpanel";
import { canCreateClassification } from "../../../libs/can-create-classification";
import Modal from "../../../components/Modal";
import ConversionPricing from "../../../components/ConversionPricing";
import { SignUpGateCTA } from "../../../components/SignUpGateCTA";
import TextAreaInput from "../../../components/TextAreaInput";
import toast from "react-hot-toast";
import { CheckCircleIcon } from "@heroicons/react/16/solid";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { NUM_FREE_CLASSIFICATIONS } from "../../../constants/classification";

const TIPS = [
  { text: "Include size, material, weight, color" },
  { text: "Describe components & dominant material" },
  { text: "Mention intended audience (children, professionals, etc.)" },
  { text: "Specify intended use (commercial, personal, household, etc.)" },
];

function NewClassificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const {
    startNewClassification,
    setArticleDescription,
    resetClassificationState,
  } = useClassification();
  const [showPricing, setShowPricing] = useState(false);
  const [showSignUpGate, setShowSignUpGate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localDescription, setLocalDescription] = useState("");
  const hasAutoSubmittedRef = useRef(false);

  const productParam = searchParams.get("product") || "";

  useEffect(() => {
    resetClassificationState();
  }, []);

  useEffect(() => {
    if (productParam && !hasAutoSubmittedRef.current) {
      setLocalDescription(productParam);
      hasAutoSubmittedRef.current = true;
    }
  }, [productParam]);

  const handleSubmit = async () => {
    if (!localDescription.trim() || loading) return;
    setLoading(true);

    try {
      const { allowed, blockReason, isPayingUser, classificationCount } =
        await canCreateClassification(user);

      if (!allowed) {
        if (blockReason === "anonymous_limit_reached") {
          setShowSignUpGate(true);
        } else {
          setArticleDescription(localDescription);
          trackEvent(MixpanelEvent.CLICKED_CLASSIFY_PRO_UPGRADE, {
            entry_point: "new_classification",
          });
          setShowPricing(true);
        }
        setLoading(false);
        return;
      }

      const newId = await startNewClassification(localDescription, true);

      if (!user) {
        trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
          item: localDescription,
          is_anonymous: true,
          entry_point: "classifications_new",
        });
        trackEvent(MixpanelEvent.ANONYMOUS_CLASSIFICATION_STARTED, {
          classification_id: newId,
          source: "classifications_new_form",
          entry_point: "classifications_new",
        });
      } else {
        const count = classificationCount ?? 0;
        const isTrialUserWithinLimit = count < NUM_FREE_CLASSIFICATIONS;
        trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
          item: localDescription,
          is_paying_user: isPayingUser,
          is_trial_user: isTrialUserWithinLimit,
          classification_count: count,
        });
      }

      router.replace(`/classifications/${newId}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again or contact support.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex items-start justify-center bg-base-100 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl mx-auto px-5 sm:px-6 pt-10 sm:pt-16 md:pt-20 pb-16">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-1.5 text-sm font-medium text-base-content/40 hover:text-base-content/70 transition-colors mb-8 sm:mb-10"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back
        </button>

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-base-content mb-3">
            Describe Your Product
          </h1>
          <p className="text-base text-base-content/50 max-w-2xl mx-auto leading-relaxed">
            Enter a detailed description of your product and we&apos;ll help you find the right HTS code
          </p>
        </div>

        {/* Input card */}
        <div className="mb-8">
          <TextAreaInput
            buttonText="Start Classification"
            placeholder="e.g. Men's 100% cotton denim jeans, dyed blue & pre-washed for an athletic figure"
            defaultValue={productParam}
            onChange={(value) => setLocalDescription(value)}
            onSubmit={handleSubmit}
            canSubmit={localDescription.trim().length > 0}
            loading={loading}
          />
        </div>

        {/* Tips */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-4 text-center">
            Tips for Best Results
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPS.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-base-200/50 border border-base-content/[0.06]"
              >
                <CheckCircleIcon className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-base-content/60 leading-relaxed">
                  {tip.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPricing && (
        <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
          <ConversionPricing />
        </Modal>
      )}
      {showSignUpGate && (
        <Modal isOpen={showSignUpGate} setIsOpen={setShowSignUpGate}>
          <SignUpGateCTA articleDescription={localDescription.trim()} />
        </Modal>
      )}
    </main>
  );
}

export default function NewClassificationPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-100">
          <span className="loading loading-spinner loading-lg text-primary" />
        </main>
      }
    >
      <NewClassificationContent />
    </Suspense>
  );
}
