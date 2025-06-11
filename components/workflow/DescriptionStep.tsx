import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { TertiaryText } from "../TertiaryText";
import TextInput from "../TextInput";
import { useEffect, useState } from "react";
import { StepNavigation } from "./StepNavigation";
import { TertiaryLabel } from "../TertiaryLabel";
import { SecondaryLabel } from "../SecondaryLabel";

interface DescriptionStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
  setClassificationLevel: (level: number | undefined) => void;
}

export const DescriptionStep = ({
  setWorkflowStep,
  setClassificationLevel,
}: DescriptionStepProps) => {
  const [localProductDescription, setLocalProductDescription] = useState("");
  const { classification, startNewClassification } = useClassification();
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
          placeholder="e.g. Men’s 100% cotton denim jeans, dyed blue, pre-washed, and tailored for an atheltic figure"
          defaultValue={productDescription}
          // onSubmit={(value) => {
          //   setProductDescription(value);
          //   setWorkflowStep(WorkflowStep.ANALYSIS);
          // }}
          onChange={(value) => {
            setLocalProductDescription(value);
          }}
        />

        <div className="flex flex-col">
          <SecondaryLabel
            value="👉 Tips for best results:"
            color={Color.NEUTRAL_CONTENT}
          />
          <ul>
            <TertiaryText
              value="-> Include details that help identify the item, such as color, size, material, weight, etc."
              color={Color.NEUTRAL_CONTENT}
            />
            <TertiaryText
              value="-> Describe each component / material and mention which one is dominant or most important."
              color={Color.NEUTRAL_CONTENT}
            />
            <TertiaryText
              value="-> Include the intended use or audience (e.g. 'for children', 'for dogs', 'for human consumption', etc)."
              color={Color.NEUTRAL_CONTENT}
            />
          </ul>
        </div>
      </div>
      {/* Horizontal line */}
      <div className="w-full border-t-2 border-base-100" />
      {/* Navigation */}
      <div className="w-full max-w-3xl mx-auto px-8">
        <StepNavigation
          next={{
            label: "Next",
            fill: true,
            onClick: () => {
              if (localProductDescription !== productDescription) {
                startNewClassification(localProductDescription);
              }
              setWorkflowStep(WorkflowStep.CLASSIFICATION);
              setClassificationLevel(0);
            },
            disabled: localProductDescription.length === 0,
          }}
        />
      </div>
    </div>
  );
};
