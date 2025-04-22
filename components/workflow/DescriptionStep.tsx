import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { PrimaryLabel } from "../PrimaryLabel";
import { TertiaryText } from "../TertiaryText";
import TextInput from "../TextInput";
import { useEffect, useState } from "react";

interface DescriptionStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const DescriptionStep = ({ setWorkflowStep }: DescriptionStepProps) => {
  const [localProductDescription, setLocalProductDescription] = useState("");
  const { classification, setProductDescription } = useClassification();
  const { productDescription } = classification;

  useEffect(() => {
    setLocalProductDescription(productDescription);
  }, [productDescription]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-14">
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
      <div className="flex justify-between">
        <button className="btn btn-link btn-primary px-0 gap-0 no-underline text-white hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out">
          <ChevronLeftIcon className="w-5 h-5" />
          Exit
        </button>
        <button
          className="btn btn-primary text-white gap-0"
          disabled={localProductDescription.length === 0}
          onClick={() => {
            setProductDescription(localProductDescription);
            setWorkflowStep(WorkflowStep.ANALYSIS);
          }}
        >
          Continue
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
