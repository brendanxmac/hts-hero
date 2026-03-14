"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useUser } from "../../../contexts/UserContext";
import {
  Product,
  userHasActivePurchaseForProduct,
} from "../../../libs/supabase/purchase";
import { fetchUser } from "../../../libs/supabase/user";
import { MixpanelEvent, trackEvent } from "../../../libs/mixpanel";
import { BackButton } from "../../../components/classification-ui/BackButton";
import Modal from "../../../components/Modal";
import ConversionPricing from "../../../components/ConversionPricing";
import TextAreaInput from "../../../components/TextAreaInput";
import toast from "react-hot-toast";
import { DocumentTextIcon } from "@heroicons/react/16/solid";

const FREE_CLASSIFICATION_LIMIT = 5;

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
  const [loading, setLoading] = useState(false);
  const [localDescription, setLocalDescription] = useState("");
  const hasAutoSubmittedRef = useRef(false);

  const productParam = searchParams.get("product") || "";

  // Clean up classification state on mount
  useEffect(() => {
    resetClassificationState();
  }, []);

  // Pre-fill from URL param and auto-submit
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
      // Anonymous users bypass pricing gates (gated after heading selection)
      if (!user) {
        const newId = await startNewClassification(localDescription, true);
        trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
          item: localDescription,
          is_anonymous: true,
        });
        router.replace(`/classifications/${newId}`);
        return;
      }

      const isPayingUser = await userHasActivePurchaseForProduct(
        user.id,
        Product.CLASSIFY
      );

      const userProfile = await fetchUser(user.id);
      const classificationCount = userProfile?.classification_count ?? 0;
      const isTrialUser = classificationCount < FREE_CLASSIFICATION_LIMIT;

      if (isPayingUser || isTrialUser) {
        const newId = await startNewClassification(localDescription, true);
        trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
          item: localDescription,
          is_paying_user: isPayingUser,
          is_trial_user: isTrialUser,
          classification_count: classificationCount,
        });
        router.replace(`/classifications/${newId}`);
      } else {
        setArticleDescription(localDescription);
        setShowPricing(true);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again or contact support.");
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] bg-base-100">
      <div className="bg-base-100/95 backdrop-blur-sm">
        <div className="w-full max-w-4xl mx-auto px-6 py-4">
          <BackButton
            onClick={() => router.push("/classifications")}
            label="Classifications"
          />
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-6 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-base-content/15 bg-base-200/50">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Step 1
                  </span>
                  <h2 className="text-xl font-bold text-base-content">
                    Enter Item Description
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <DocumentTextIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
                  Item Description
                </span>
              </div>

              <TextAreaInput
                buttonText="Start Classification"
                placeholder="e.g. Men's 100% cotton denim jeans, dyed blue & pre-washed for an athletic figure"
                defaultValue={productParam}
                onChange={(value) => setLocalDescription(value)}
                onSubmit={handleSubmit}
                canSubmit={localDescription.trim().length > 0}
                loading={loading}
              />

              <div className="flex flex-col gap-3 mt-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                  Tips for Best Results
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      emoji: "📏",
                      text: "Include size, material, weight, color",
                    },
                    {
                      emoji: "🧵",
                      text: "Describe components & dominant material",
                    },
                    {
                      emoji: "👥",
                      text: "Mention intended audience (children, professionals, etc...)",
                    },
                    {
                      emoji: "🎯",
                      text: "Specify intended use (commercial, personal, household, etc...)",
                    },
                  ].map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-base-100/50 border border-base-content/10"
                    >
                      <span className="text-lg">{tip.emoji}</span>
                      <span className="text-sm text-base-content/70">
                        {tip.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPricing && (
        <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
          <ConversionPricing />
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
