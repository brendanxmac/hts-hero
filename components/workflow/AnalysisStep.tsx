import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import { Color } from "../../enums/style";
import { PrimaryLabel } from "../PrimaryLabel";
import { TertiaryText } from "../TertiaryText";
import TextInput from "../TextInput";
import { useEffect, useState } from "react";
import { StepNavigation } from "./StepNavigation";

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
    <div className="h-full flex flex-col">
      <div className="grow flex flex-col gap-10 px-8 justify-center border-b-2 border-base-100">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col gap-2">
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
      </div>
      <div className="w-full max-w-3xl mx-auto">
        <StepNavigation
          next={{
            label: "Continue",
            onClick: () => {
              setAnalysis(localAnalysis);
              setWorkflowStep(WorkflowStep.CLASSIFICATION);
            },
            disabled: localAnalysis.length === 0,
          }}
          previous={{
            label: "Back",
            onClick: () => {
              setWorkflowStep(WorkflowStep.DESCRIPTION);
            },
            disabled: false,
          }}
        />
      </div>
    </div>
  );
};
