import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { TertiaryText } from "../TertiaryText";
import TextAreaInput from "../TextAreaInput";
import { useEffect, useState } from "react";
import { TertiaryLabel } from "../TertiaryLabel";
import { SecondaryLabel } from "../SecondaryLabel";
import {
  Product,
  userHasActivePurchaseForProduct,
} from "../../libs/supabase/purchase";
import { useUser } from "../../contexts/UserContext";
import { isWithinPastNDays } from "../../utilities/time";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { ClassifyPage } from "../../enums/classify";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
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
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="grow w-full max-w-3xl mx-auto flex flex-col px-8 justify-center gap-5">
        {/* Add a button to go back to classifications */}
        {(!classification || !classification?.articleDescription) && (
          <button
            className="w-fit btn btn-sm btn-square p-2"
            onClick={() => setPage(ClassifyPage.CLASSIFICATIONS)}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <TertiaryLabel value="Item Description" />
          </div>
          <h2 className={`font-bold text-2xl`}>
            Enter a detailed description of your item
          </h2>
        </div>
        <TextAreaInput
          placeholder="e.g. Men's 100% cotton denim jeans, dyed blue & pre-washed for an athletic figure"
          defaultValue={classification?.articleDescription || ""}
          onChange={(value) => {
            setLocalItemDescription(value);
          }}
          onSubmit={async () => {
            setLoading(true);
            try {
              const userCreatedDate = user ? new Date(user.created_at) : null;
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
                  localItemDescription !== classification?.articleDescription
                ) {
                  await startNewClassification(localItemDescription);
                  // Very important, this is what gets the newly created classification record
                  // which controls the rest of the classification flow
                  await refreshClassifications();

                  // Track classification started event
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

        <div className="flex flex-col">
          <SecondaryLabel
            value="Tips for Best Assistance:"
            color={Color.BASE_CONTENT}
          />
          <ul className="pl-2">
            <div className="flex gap-3">
              <p>👉</p>
              <TertiaryText
                value={`Include details like size, material, weight, color, etc.`}
                color={Color.BASE_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>👉</p>
              <TertiaryText
                value="Describe each component / material and mention which one is dominant."
                color={Color.BASE_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>👉</p>

              <TertiaryText
                value="Include the intended audience -> 'for children / dogs /  firefighters / etc...'"
                color={Color.BASE_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>👉</p>

              <TertiaryText
                value="Include the intended use -> 'for consumption / commercial use / personal use / etc...'"
                color={Color.BASE_CONTENT}
              />
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
};
