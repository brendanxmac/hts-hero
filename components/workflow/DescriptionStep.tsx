import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { PrimaryLabel } from "../PrimaryLabel";
import { TertiaryText } from "../TertiaryText";
import TextInput from "../TextInput";
import { useEffect, useState } from "react";
import { StepNavigation } from "./StepNavigation";
import { TertiaryLabel } from "../TertiaryLabel";

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
      <div className="grow w-full max-w-3xl mx-auto flex flex-col px-8 justify-center gap-8">
        <div className="flex flex-col gap-2">
          <TertiaryLabel
            value="Item Description"
            color={Color.NEUTRAL_CONTENT}
          />
          <PrimaryLabel
            value="Describe the article you are classifying"
            color={Color.WHITE}
          />

          <div className="flex flex-col">
            <TertiaryLabel
              value="⚡️ For best results, include:"
              color={Color.NEUTRAL_CONTENT}
            />
            <ul>
              <TertiaryText
                value="-> Details that help identify the item, such as color, size, material, etc."
                color={Color.NEUTRAL_CONTENT}
              />
              <TertiaryText
                value="-> Describe each part of material and mention which one is dominant or most important."
                color={Color.NEUTRAL_CONTENT}
              />
              <TertiaryText
                value="-> The intended use or audience (e.g. 'for children', 'for dogs', 'for human consumption', etc)."
                color={Color.NEUTRAL_CONTENT}
              />
            </ul>
          </div>
        </div>
        <TextInput
          placeholder="Enter item description"
          defaultValue={productDescription}
          // onSubmit={(value) => {
          //   setProductDescription(value);
          //   setWorkflowStep(WorkflowStep.ANALYSIS);
          // }}
          onChange={(value) => {
            setLocalProductDescription(value);
          }}
        />
      </div>
      {/* Horizontal line */}
      <div className="w-full border-t-2 border-base-100" />
      {/* Navigation */}
      <div className="w-full max-w-3xl mx-auto px-8">
        <StepNavigation
          next={{
            label: "Next",
            onClick: () => {
              startNewClassification(localProductDescription);
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
