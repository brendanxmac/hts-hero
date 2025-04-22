import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { PrimaryLabel } from "../PrimaryLabel";
import { TertiaryText } from "../TertiaryText";
import TextInput from "../TextInput";
import { useEffect, useState } from "react";

interface AnalysisStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const AnalysisStep = ({ setWorkflowStep }: AnalysisStepProps) => {
  const [localAnalysis, setLocalAnalysis] = useState("");
  const { classification, setAnalysis } = useClassification();
  const { analysis } = classification;

  useEffect(() => {
    setLocalAnalysis(analysis);
  }, [analysis]);

  return (
    <div className="flex flex-col gap-8">
      <div className="h-full flex flex-col gap-14">
        <div className="h-full flex flex-col gap-2">
          <TertiaryText value="Step 2" color={Color.NEUTRAL_CONTENT} />
          <PrimaryLabel
            value="Provide an analysis of the article"
            color={Color.WHITE}
          />
        </div>
        <TextInput
          placeholder="Enter item description"
          defaultValue={analysis}
          onSubmit={(value) => {
            setAnalysis(value);
            setWorkflowStep(WorkflowStep.ANALYSIS);
          }}
          onChange={(value) => {
            setLocalAnalysis(value);
          }}
        />
      </div>
      <div className="flex justify-between">
        <button
          className="btn btn-link btn-primary px-0 gap-0 no-underline text-white hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
          onClick={() => {
            setWorkflowStep(WorkflowStep.DESCRIPTION);
          }}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Back
        </button>
        <button
          className="btn btn-primary text-white gap-0"
          disabled={localAnalysis.length === 0}
          onClick={() => {
            setAnalysis(localAnalysis);
            setWorkflowStep(WorkflowStep.CLASSIFICATION);
          }}
        >
          Continue
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
