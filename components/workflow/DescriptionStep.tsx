import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { PrimaryLabel } from "../PrimaryLabel";
import { TertiaryText } from "../TertiaryText";
import TextInput from "../TextInput";
import { useEffect, useState } from "react";
import { StepNavigation } from "./StepNavigation";

interface DescriptionStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
  setActiveClassificationLevel: (level: number | undefined) => void;
}

export const DescriptionStep = ({
  setWorkflowStep,
  setActiveClassificationLevel,
}: DescriptionStepProps) => {
  const [localProductDescription, setLocalProductDescription] = useState("");
  const { classification, setProductDescription } = useClassification();
  const { productDescription } = classification;

  useEffect(() => {
    setLocalProductDescription(productDescription);
  }, [productDescription]);

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="grow w-full max-w-3xl mx-auto flex flex-col px-8 justify-center gap-8">
        <div className="flex flex-col gap-2">
          <TertiaryText value="Step 1" color={Color.NEUTRAL_CONTENT} />
          <PrimaryLabel
            value="Describe the article you are classifying"
            color={Color.WHITE}
          />
        </div>
        <TextInput
          placeholder="Enter item description"
          defaultValue={productDescription}
          onSubmit={(value) => {
            setProductDescription(value);
            setWorkflowStep(WorkflowStep.ANALYSIS);
          }}
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
            label: "Continue",
            onClick: () => {
              setProductDescription(localProductDescription);
              setWorkflowStep(WorkflowStep.ANALYSIS);
            },
            disabled: localProductDescription.length === 0,
          }}
        />
      </div>
    </div>
  );
};
