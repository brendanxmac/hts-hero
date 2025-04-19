import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { WorkflowStep } from "../../app/classify/page";
import { PrimaryLabel } from "../PrimaryLabel";

interface WorkflowHeaderProps {
  currentStep: WorkflowStep;
  previousStep?: WorkflowStep;
  nextStep?: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
}

const getStepName = (step: WorkflowStep) => {
  switch (step) {
    case WorkflowStep.DESCRIPTION:
      return "Description";
    case WorkflowStep.ANALYSIS:
      return "Analysis";
    case WorkflowStep.CLASSIFICATION:
      return "Classification";
  }
};

export const WorkflowHeader = ({
  previousStep,
  currentStep,
  nextStep,
  setWorkflowStep,
}: WorkflowHeaderProps) => {
  return (
    <div className="flex justify-between items-center w-full">
      <div>
        {previousStep ? (
          <button
            className="flex items-center gap-2 btn btn-xs btn-link hover:text-secondary hover:scale-105 px-1"
            onClick={() => {
              setWorkflowStep(previousStep);
            }}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>{getStepName(previousStep)}</span>
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>
      <PrimaryLabel value={getStepName(currentStep)} />
      <div>
        {nextStep ? (
          <button
            className="flex items-center gap-2 btn btn-xs btn-link hover:text-secondary hover:scale-105 px-1"
            onClick={() => {
              setWorkflowStep(nextStep);
            }}
          >
            <span>{getStepName(nextStep)}</span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>
    </div>
  );
};
