"use client";

import { useClassification } from "../../contexts/ClassificationContext";
import { useEffect, useState, useRef } from "react";
import {
  Product,
  userHasActivePurchaseForProduct,
} from "../../libs/supabase/purchase";
import { useUser } from "../../contexts/UserContext";
import { fetchUser } from "../../libs/supabase/user";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { DocumentTextIcon } from "@heroicons/react/16/solid";
import toast from "react-hot-toast";
import { ClassificationRecord } from "../../interfaces/hts";
import { useClassifications } from "../../contexts/ClassificationsContext";
import TextAreaInput from "../TextAreaInput";

interface Props {
  setShowPricing: (show: boolean) => void;
  classificationRecord?: ClassificationRecord | undefined;
  onDescriptionSubmitted?: () => void;
}

export const VerticalDescriptionStep = ({
  setShowPricing,
  classificationRecord,
  onDescriptionSubmitted,
}: Props) => {
  const { user } = useUser();
  const { classification, startNewClassification, setArticleDescription } =
    useClassification();
  const { refreshClassifications } = useClassifications();
  const [localItemDescription, setLocalItemDescription] = useState(
    classification?.articleDescription || ""
  );
  const [loading, setLoading] = useState(false);
  const hasAutoSubmittedRef = useRef(false);

  useEffect(() => {
    setLocalItemDescription(classification?.articleDescription || "");
  }, [classification?.articleDescription]);

  // Check for pre-filled description from CTA (via sessionStorage)
  useEffect(() => {
    if (hasAutoSubmittedRef.current) return;
    const prefilled = sessionStorage.getItem("cta_classification_description");
    if (prefilled) {
      sessionStorage.removeItem("cta_classification_description");
      setLocalItemDescription(prefilled);
      hasAutoSubmittedRef.current = true;
    }
  }, []);

  const isUsersClassification = classificationRecord
    ? user ? classificationRecord.user_id === user.id : !classificationRecord.user_id
    : true;

  const FREE_CLASSIFICATION_LIMIT = 5;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Anonymous users can always start a classification (gated after heading selection)
      if (!user) {
        if (localItemDescription !== classification?.articleDescription) {
          await startNewClassification(localItemDescription, true);
          onDescriptionSubmitted?.();
          refreshClassifications();

          trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
            item: localItemDescription,
            is_anonymous: true,
          });
        }
        return;
      }

      const isPayingUser = await userHasActivePurchaseForProduct(
        user.id,
        Product.CLASSIFY
      );

      // Count-based trial: check classification_count from user profile
      const userProfile = await fetchUser(user.id);
      const classificationCount = userProfile?.classification_count ?? 0;
      const isTrialUser = classificationCount < FREE_CLASSIFICATION_LIMIT;

      if (isPayingUser || isTrialUser) {
        if (localItemDescription !== classification?.articleDescription) {
          await startNewClassification(localItemDescription, true);
          onDescriptionSubmitted?.();
          refreshClassifications();

          trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
            item: localItemDescription,
            is_paying_user: isPayingUser,
            is_trial_user: isTrialUser,
            classification_count: classificationCount,
          });
        }
      } else {
        setArticleDescription(localItemDescription);
        setShowPricing(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-base-content/15 bg-base-200/50">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6">
        {/* Step Header */}
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

        {/* Description content */}
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
            defaultValue={classification?.articleDescription || ""}
            onChange={(value) => {
              setLocalItemDescription(value);
            }}
            onSubmit={handleSubmit}
            canSubmit={
              classificationRecord === undefined &&
              isUsersClassification &&
              localItemDescription.length > 0
            }
            disabled={classificationRecord !== undefined}
            loading={loading}
          />

          {/* Tips Section */}
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
                  text: "Mention intended audience (children, professionals)",
                },
                {
                  emoji: "🎯",
                  text: "Specify intended use (commercial, personal)",
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
  );
};
