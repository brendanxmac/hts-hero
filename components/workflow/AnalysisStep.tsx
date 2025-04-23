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
  setActiveClassificationLevel: (level: number | undefined) => void;
}

export const AnalysisStep = ({
  setWorkflowStep,
  setActiveClassificationLevel,
}: AnalysisStepProps) => {
  const [localAnalysis, setLocalAnalysis] = useState("");
  const { classification, setAnalysis } = useClassification();
  const { analysis } = classification;

  useEffect(() => {
    setLocalAnalysis(analysis);
  }, [analysis]);

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="grow w-full max-w-3xl mx-auto flex flex-col px-8 justify-center gap-8">
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
      {/* Horizontal line */}
      <div className="w-full border-t-2 border-base-100" />
      {/* Navigation */}
      <div className="w-full max-w-3xl mx-auto px-8">
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
