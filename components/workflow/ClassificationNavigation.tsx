"use client";

import {
  Bars3BottomLeftIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { WorkflowStep } from "../../enums/hts";
import { SecondaryLabel } from "../SecondaryLabel";
import { classNames } from "../../utilities/style";
import { useClassification } from "../../contexts/ClassificationContext";
import { TertiaryText } from "../TertiaryText";
import { Color } from "../../enums/style";
import { IconTab } from "../../interfaces/tab";
import { ChartPieIcon, ChevronLeftIcon } from "@heroicons/react/16/solid";

export enum ClassifyTab {
  CLASSIFY = "classify",
  EXPLORE = "explore",
}

export const tabs: IconTab<ClassifyTab>[] = [
  {
    value: ClassifyTab.CLASSIFY,
    icon: <CheckIcon className="w-5 h-5" />,
  },
  {
    value: ClassifyTab.EXPLORE,
    icon: <MagnifyingGlassIcon className="w-5 h-5" />,
  },
];

interface ClassificationNavigationProps {
  activeTab: ClassifyTab;
  setActiveTab: (tab: ClassifyTab) => void;
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
}

export const ClassificationNavigation = ({
  activeTab,
  setActiveTab,
  workflowStep,
  setWorkflowStep,
}: ClassificationNavigationProps) => {
  const { classification } = useClassification();
  const { productDescription, analysis } = classification;

  return (
    <div className="flex flex-col p-4 gap-2">
      <div className="flex justify-between items-center">
        <button
          className="btn btn-link btn-primary px-0 gap-0 hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
          onClick={() => {
            console.log("Back clicked, need to navigate back to home view...");
          }}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Home
        </button>

        <div className="grow text-center">
          <SecondaryLabel value="New Classification" />
        </div>

        <div
          role="tablist"
          className="tabs tabs-boxed tabs-sm bg-primary-content p-1.5 gap-1 rounded-xl"
        >
          {tabs.map((tab) => (
            <a
              key={tab.value}
              role="tab"
              onClick={() => setActiveTab(tab.value as ClassifyTab)}
              className={classNames(
                "tab px-1 hover:text-primary hover:scale-105 transition-all duration-100 ease-in-out",
                tab.value === activeTab && "tab-active"
              )}
            >
              {tab.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className={classNames(
            "flex flex-col rounded-md px-2 py-4 gap-2",
            productDescription && "bg-none",
            workflowStep === WorkflowStep.DESCRIPTION && "bg-primary/30"
          )}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Bars3BottomLeftIcon className="w-5 h-5 text-white" />
              <SecondaryLabel
                value="Description"
                color={
                  workflowStep === WorkflowStep.DESCRIPTION
                    ? Color.WHITE
                    : Color.NEUTRAL_CONTENT
                }
              />
            </div>
            {productDescription &&
              workflowStep !== WorkflowStep.DESCRIPTION && (
                <button
                  className="btn btn-link btn-primary btn-xs px-0 gap-0 hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
                  onClick={() => {
                    setWorkflowStep(WorkflowStep.DESCRIPTION);
                  }}
                >
                  Edit
                </button>
              )}
          </div>
          {productDescription && (
            <TertiaryText value={productDescription} color={Color.WHITE} />
          )}
        </div>
        <div
          className={classNames(
            "flex flex-col rounded-md px-2 py-4 gap-2",
            analysis && "bg-none",
            workflowStep === WorkflowStep.ANALYSIS && "bg-primary/30"
          )}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <ChartPieIcon className="w-5 h-5 text-white" />
              <SecondaryLabel
                value="Analysis"
                color={
                  workflowStep === WorkflowStep.ANALYSIS
                    ? Color.WHITE
                    : Color.NEUTRAL_CONTENT
                }
              />
            </div>
            {analysis && workflowStep !== WorkflowStep.ANALYSIS && (
              <button
                className="btn btn-link btn-primary btn-xs px-0 gap-0 hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
                onClick={() => {
                  setWorkflowStep(WorkflowStep.ANALYSIS);
                }}
              >
                Edit
              </button>
            )}
          </div>
          {analysis && <TertiaryText value={analysis} color={Color.WHITE} />}
        </div>
        <div
          className={classNames(
            "flex items-center rounded-md px-2 py-4",
            classification.progressionLevels.length > 0 && "bg-none",
            workflowStep === WorkflowStep.CLASSIFICATION && "bg-primary/30"
          )}
        >
          <div className="flex items-center gap-4">
            <CheckIcon className="w-5 h-5 text-white" />
            <SecondaryLabel
              value="Classification"
              color={
                workflowStep === WorkflowStep.CLASSIFICATION
                  ? Color.WHITE
                  : Color.NEUTRAL_CONTENT
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
