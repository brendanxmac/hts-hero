import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { TertiaryText } from "../TertiaryText";
import TextInput from "../TextInput";
import { useEffect, useState } from "react";
import { StepNavigation } from "./StepNavigation";
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
  const [localProductDescription, setLocalProductDescription] = useState("");
  const { classification, startNewClassification, setArticleDescription } =
    useClassification();
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
            {/* <button className="btn w-fit btn-xs text-white border border-neutral-content hover:bg-primary">
              <span className="text-base">🚀</span> Tips for best results
            </button> */}
          </div>
          <h2 className={`text-white font-bold text-2xl`}>
            Enter a detailed description of your item
          </h2>
        </div>
        <TextInput
          placeholder="e.g. Men's 100% cotton denim jeans, dyed blue, pre-washed, and tailored for an atheltic figure"
          defaultValue={productDescription}
          onChange={(value) => {
            setLocalProductDescription(value);
          }}
        />

        <div className="flex flex-col">
          <SecondaryLabel
            value="For Best Assistance:"
            color={Color.NEUTRAL_CONTENT}
          />
          <ul className="pl-2">
            <div className="flex gap-3">
              <p>1️⃣</p>
              <TertiaryText
                value={`Include details that help identify the item, such as color, size, material, weight, etc.`}
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>2️⃣</p>
              <TertiaryText
                value="Describe each component / material and mention which one is dominant."
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>3️⃣</p>

              <TertiaryText
                value="Include the intended audience -> 'for children / dogs /  firefighters / etc...'"
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
            <div className="flex gap-3">
              <p>4️⃣</p>

              <TertiaryText
                value="Include the intended use -> 'for commercial / personal / industrial / outdoor use'"
                color={Color.NEUTRAL_CONTENT}
              />
            </div>
          </ul>
        </div>
      </div>
      {/* Horizontal line */}
      <div className="w-full border-t-2 border-base-100" />
      {/* Navigation */}
      <div className="w-full max-w-3xl mx-auto px-8">
        <StepNavigation
          next={{
            label: "Start",
            fill: true,
            onClick: async () => {
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
            },
            disabled: localProductDescription.length === 0,
          }}
        />
      </div>
    </div>
  );
};
