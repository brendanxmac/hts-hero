import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import TextAreaInput from "../TextAreaInput";
import { useEffect, useState } from "react";
import {
  Product,
  userHasActivePurchaseForProduct,
} from "../../libs/supabase/purchase";
import { useUser } from "../../contexts/UserContext";
import { isWithinPastNDays } from "../../utilities/time";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { ClassifyPage } from "../../enums/classify";
import { ArrowLeftIcon, DocumentTextIcon } from "@heroicons/react/16/solid";
import toast from "react-hot-toast";
import { ClassificationRecord } from "../../interfaces/hts";
import { useClassifications } from "../../contexts/ClassificationsContext";

interface Props {
  setPage: (page: ClassifyPage) => void;
  setWorkflowStep: (step: WorkflowStep) => void;
  setClassificationLevel: (level: number | undefined) => void;
  setShowPricing: (show: boolean) => void;
  classificationRecord?: ClassificationRecord | undefined;
}

export const DescriptionStep = ({
  setPage,
  setWorkflowStep,
  setClassificationLevel,
  setShowPricing,
  classificationRecord,
}: Props) => {
  const { user } = useUser();
  const { classification, startNewClassification, setArticleDescription } =
    useClassification();
  const { refreshClassifications } = useClassifications();
  const [localItemDescription, setLocalItemDescription] = useState(
    classification?.articleDescription || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalItemDescription(classification?.articleDescription || "");
  }, [classification?.articleDescription]);

  const isUsersClassification = classificationRecord
    ? classificationRecord.user_id === user.id
    : true;

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-200 border-b border-base-content/5">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-8 md:py-10">
          {/* Back button */}
          {(!classification || !classification?.articleDescription) && (
            <button
              className="group flex items-center gap-2 mb-6 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors"
              onClick={() => setPage(ClassifyPage.CLASSIFICATIONS)}
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Classifications
            </button>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Step 1 of Classification
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-base-content via-base-content to-base-content/80 bg-clip-text">
                Item Description
              </span>
            </h1>
            <p className="text-base-content/60 text-sm md:text-base max-w-lg mt-1">
              Enter a detailed description of the item you are classifying.
              Include materials, dimensions, and intended use.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col px-6 py-8 gap-6">
        {/* Input Card */}
        <div className="relative overflow-hidden rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/40 p-6">
          {/* Subtle decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-primary/70" />
              <span className="text-sm font-semibold uppercase tracking-wider text-base-content/70">
                Product Description
              </span>
            </div>

            <TextAreaInput
              buttonText="Start Classification"
              placeholder="e.g. Men's 100% cotton denim jeans, dyed blue & pre-washed for an athletic figure"
              defaultValue={classification?.articleDescription || ""}
              onChange={(value) => {
                setLocalItemDescription(value);
              }}
              onSubmit={async () => {
                setLoading(true);
                try {
                  const userCreatedDate = user
                    ? new Date(user.created_at)
                    : null;
                  const isTrialUser = userCreatedDate
                    ? isWithinPastNDays(userCreatedDate, 7)
                    : false;

                  const isPayingUser = user
                    ? await userHasActivePurchaseForProduct(
                        user.id,
                        Product.CLASSIFY
                      )
                    : false;

                  if (isPayingUser || isTrialUser) {
                    if (
                      localItemDescription !==
                      classification?.articleDescription
                    ) {
                      await startNewClassification(localItemDescription);
                      await refreshClassifications();

                      trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
                        item: localItemDescription,
                        is_paying_user: isPayingUser,
                        is_trial_user: isTrialUser,
                      });
                    }

                    setWorkflowStep(WorkflowStep.CLASSIFICATION);
                    setClassificationLevel(0);
                  } else {
                    setArticleDescription(localItemDescription);
                    setShowPricing(true);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(
                    "Something went wrong. Please try again or contact support."
                  );
                } finally {
                  setLoading(false);
                }
              }}
              canSubmit={
                classificationRecord === undefined &&
                isUsersClassification &&
                localItemDescription.length > 0
              }
              disabled={classificationRecord !== undefined}
              loading={loading}
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
            Tips for Best Results
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { emoji: "📏", text: "Include size, material, weight, color" },
              { emoji: "🧵", text: "Describe components & dominant material" },
              {
                emoji: "👥",
                text: "Mention intended audience (children, professionals)",
              },
              {
                emoji: "🎯",
                text: "Specify intended use within the United States (commercial, personal, for sports, etc...)",
              },
            ].map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-base-200/50 border border-base-content/5"
              >
                <span className="text-lg">{tip.emoji}</span>
                <span className="text-sm text-base-content/70">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
