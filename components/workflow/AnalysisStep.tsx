import { WorkflowStep } from "../../app/classify/page";
import { useClassification } from "../../contexts/ClassificationContext";
import { SecondaryLabel } from "../SecondaryLabel";
import { TextDisplay } from "../TextDisplay";
import TextInput from "../TextInput";
import { WorkflowHeader } from "./WorkflowHeader";

interface AnalysisStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const AnalysisStep = ({ setWorkflowStep }: AnalysisStepProps) => {
  const { classification, setAnalysis } = useClassification();
  const { productDescription } = classification;

  return (
    <div className="h-full flex flex-col gap-8">
      <WorkflowHeader
        currentStep={WorkflowStep.ANALYSIS}
        previousStep={WorkflowStep.DESCRIPTION}
        nextStep={WorkflowStep.CLASSIFICATION}
        setWorkflowStep={setWorkflowStep}
      />

      <div className="border-b border-base-content/10 pb-4">
        <TextDisplay title="Item Description" text={productDescription} />
      </div>

      <div className="flex flex-col gap-4">
        <SecondaryLabel value="Item Analysis" />
        <TextInput
          placeholder="Enter item analysis"
          setProductDescription={(value) => {
            setAnalysis(value);
            setWorkflowStep(WorkflowStep.CLASSIFICATION);
          }}
        />
      </div>
    </div>
  );
};
