import { WorkflowStep } from "../../app/classify/page";

interface ClassificationStepProps {
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const ClassificationStep = ({
  setWorkflowStep,
}: ClassificationStepProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h1>Classification Step</h1>
      <button onClick={() => setWorkflowStep(WorkflowStep.DESCRIPTION)}>
        Description
      </button>
      <button onClick={() => setWorkflowStep(WorkflowStep.ANALYSIS)}>
        Analysis
      </button>
      <button onClick={() => setWorkflowStep(WorkflowStep.CLASSIFICATION)}>
        Classification
      </button>
    </div>
  );
};
