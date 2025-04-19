import { PencilIcon } from "@heroicons/react/24/solid";
import { useClassification } from "../../contexts/ClassificationContext";
import { WorkflowStep } from "../../enums/hts";
import SquareIconButton from "../SqaureIconButton";
import { TextDisplay } from "../TextDisplay";
import { WorkflowHeader } from "./WorkflowHeader";

interface ClassificationStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const ClassificationStep = ({
  setWorkflowStep,
}: ClassificationStepProps) => {
  const { classification, setAnalysis } = useClassification();
  const { productDescription, analysis } = classification;

  return (
    <div className="h-full flex flex-col gap-8">
      <WorkflowHeader
        currentStep={WorkflowStep.CLASSIFICATION}
        previousStep={WorkflowStep.ANALYSIS}
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

      <div className="border-b border-base-content/10 pb-4 flex flex-col">
        <div className="flex justify-between">
          <TextDisplay title="Item Analysis" text={analysis} />
          {!analysis && (
            <SquareIconButton
              icon={<PencilIcon className="h-4 w-4" />}
              onClick={() => {
                console.log("generate analysis clicked");
              }}
            />
          )}
        </div>
        {!analysis && <span className="text-sm text-base-content/50">N/A</span>}
      </div>
    </div>
  );
};
