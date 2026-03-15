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
    ? user
      ? classificationRecord.user_id === user.id
      : !classificationRecord.user_id
    : true;

  const FREE_CLASSIFICATION_LIMIT = 5;

  const handleSubmit = async () => {
    setLoading(true);
    try {
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
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
        <div className="flex items-center gap-2.5">
          <DocumentTextIcon className="w-4 h-4 text-base-content/50" />
          <h3 className="text-sm font-semibold text-base-content">
            Item Description
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
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

        {/* Tips */}
        <div className="mt-5 pt-5 border-t border-base-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">
            Tips for best results
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { emoji: "📏", text: "Include size, material, weight, color" },
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
                className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-base-200/50 border border-base-300"
              >
                <span className="text-sm">{tip.emoji}</span>
                <span className="text-xs text-base-content/60 leading-relaxed">
                  {tip.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
