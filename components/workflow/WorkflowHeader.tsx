import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { WorkflowStep } from "../../enums/hts";
import { PrimaryLabel } from "../PrimaryLabel";

interface WorkflowHeaderProps {
  currentStep: WorkflowStep;
  previousStep?: WorkflowStep;
  nextStep?: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
  showExplore: boolean;
  setShowExplore: (show: boolean) => void;
}

export const WorkflowHeader = ({
  previousStep,
  currentStep,
  nextStep,
  setWorkflowStep,
  showExplore,
  setShowExplore,
}: WorkflowHeaderProps) => {
  const getStepName = (step: WorkflowStep) => {
    switch (step) {
      case WorkflowStep.DESCRIPTION:
        return "Description";
      case WorkflowStep.CLASSIFICATION:
        return "Classification";
    }
  };

  return (
    <div className="grid grid-cols-3 items-center w-full">
      <div className="flex justify-start">
        {previousStep ? (
          <button
            className="flex items-center gap-2 btn btn-xs btn-link hover:text-secondary hover:scale-105 px-0"
            onClick={() => {
              setWorkflowStep(previousStep);
            }}
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>{getStepName(previousStep)}</span>
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>
      <div className="flex justify-center">
        <PrimaryLabel value={getStepName(currentStep)} />
      </div>
      <div className="flex justify-end">
        {currentStep === WorkflowStep.CLASSIFICATION ? (
          <button
            className="btn btn-xs btn-primary"
            onClick={() => {
              setShowExplore(!showExplore);
            }}
          >
            <span>{showExplore ? "Hide Explorer" : "Show Explorer"}</span>
          </button>
        ) : (
          <div>
            {nextStep ? (
              <button
                className="flex items-center gap-2 btn btn-xs btn-link hover:text-secondary hover:scale-105 px-0"
                onClick={() => {
                  setWorkflowStep(nextStep);
                }}
              >
                <span>{getStepName(nextStep)}</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
