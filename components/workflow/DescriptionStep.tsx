import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { TertiaryText } from "../TertiaryText";
import TextInput from "../TextInput";
import { useEffect, useState } from "react";
import { TertiaryLabel } from "../TertiaryLabel";
import { SecondaryLabel } from "../SecondaryLabel";
import { userHasActivePurchase } from "../../libs/supabase/purchase";
import { useUser } from "../../contexts/UserContext";
import { isWithinPastNDays } from "../../utilities/time";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";

interface Props {
  setWorkflowStep: (step: WorkflowStep) => void;
  setClassificationLevel: (level: number | undefined) => void;
  setShowPricing: (show: boolean) => void;
}

export const DescriptionStep = ({
  setWorkflowStep,
  setClassificationLevel,
  setShowPricing,
}: Props) => {
  const { user } = useUser();
  const { classification, startNewClassification, setArticleDescription } =
    useClassification();
  const [localProductDescription, setLocalProductDescription] = useState(
    classification.articleDescription
  );
  const [loading, setLoading] = useState(false);
  const { articleDescription: productDescription } = classification;

  useEffect(() => {
    setLocalProductDescription(productDescription);
  }, [productDescription]);

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="grow w-full max-w-3xl mx-auto flex flex-col px-8 justify-center gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <TertiaryLabel
              value="Item Description"
              color={Color.NEUTRAL_CONTENT}
            />
          </div>
          <h2 className={`text-white font-bold text-2xl`}>
            Enter a detailed description of your item
          </h2>
        </div>
        <TextInput
          placeholder="e.g. Men's 100% cotton denim jeans, dyed blue & pre-washed for an athletic figure"
          defaultValue={productDescription}
          onChange={(value) => {
            setLocalProductDescription(value);
          }}
          onSubmit={async () => {
            setLoading(true);
            const userCreatedDate = user ? new Date(user.created_at) : null;
            const isTrialUser = userCreatedDate
              ? isWithinPastNDays(userCreatedDate, 14)
              : false;

            const isPayingUser = user
              ? await userHasActivePurchase(user.id)
              : false;

            if (isPayingUser || isTrialUser) {
              if (localProductDescription !== productDescription) {
                startNewClassification(localProductDescription);
              }

              setWorkflowStep(WorkflowStep.CLASSIFICATION);
              setClassificationLevel(0);

              // Track classification started event
              trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
                item: localProductDescription,
                is_paying_user: isPayingUser,
                is_trial_user: isTrialUser,
              });
            } else {
              setArticleDescription(localProductDescription);
              setShowPricing(true);
            }
            setLoading(false);
          }}
          disabled={localProductDescription.length === 0}
          loading={loading}
        />

        <div className="flex flex-col">
          <SecondaryLabel
            value="Tips for Best Assistance:"
            color={Color.NEUTRAL_CONTENT}
          />
          <ul className="pl-2">
            <div className="flex gap-3">
              <p>👉</p>
              <TertiaryText
                value={`Include details like size, material, weight, color, etc.`}
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>👉</p>
              <TertiaryText
                value="Describe each component / material and mention which one is dominant."
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>👉</p>

              <TertiaryText
                value="Include the intended audience -> 'for children / dogs /  firefighters / etc...'"
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>👉</p>

              <TertiaryText
                value="Include the intended use -> 'for consumption / commercial use / personal use / etc...'"
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
};
