import { SparklesIcon } from "@heroicons/react/24/solid";
import { ChevronDoubleRightIcon, PencilIcon } from "@heroicons/react/16/solid";
import { WorkflowStep } from "../../enums/hts";
import { useClassification } from "../../contexts/ClassificationContext";
import { SecondaryLabel } from "../SecondaryLabel";
import SquareIconButton from "../SqaureIconButton";
import { TextDisplay } from "../TextDisplay";
import TextInput from "../TextInput";
import { WorkflowHeader } from "./WorkflowHeader";

interface AnalysisStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const AnalysisStep = ({ setWorkflowStep }: AnalysisStepProps) => {
  const { classification, setAnalysis } = useClassification();
  const { productDescription, analysis } = classification;

  return (
    <div className="h-full flex flex-col gap-8">
      <WorkflowHeader
        currentStep={WorkflowStep.ANALYSIS}
        previousStep={WorkflowStep.DESCRIPTION}
        nextStep={WorkflowStep.CLASSIFICATION}
        setWorkflowStep={setWorkflowStep}
      />

      <div className="border-b border-base-content/10 pb-4 flex justify-between">
        <TextDisplay title="Item Description" text={productDescription} />
        <SquareIconButton
          icon={<PencilIcon className="h-4 w-4" />}
          onClick={() => {
            setWorkflowStep(WorkflowStep.DESCRIPTION);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SecondaryLabel value="Item Analysis" />
          <div className="flex gap-2 items-center">
            <SquareIconButton
              icon={<SparklesIcon className="h-4 w-4" />}
              onClick={() => {
                console.log("generate analysis clicked");
              }}
            />
            {!analysis && (
              <button
                className="self-end btn btn-xs btn-primary gap-0"
                onClick={() => {
                  setWorkflowStep(WorkflowStep.CLASSIFICATION);
                }}
              >
                <span>skip</span>
                <ChevronDoubleRightIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <TextInput
          placeholder="Enter item analysis"
          onChange={(value) => {
            setAnalysis(value);
          }}
          onSubmit={(value) => {
            setAnalysis(value);
            setWorkflowStep(WorkflowStep.CLASSIFICATION);
          }}
        />
      </div>
    </div>
  );
};
