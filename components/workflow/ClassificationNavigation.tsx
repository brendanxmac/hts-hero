"use client";

import { Bars3BottomLeftIcon, HomeIcon } from "@heroicons/react/24/solid";
import { WorkflowStep } from "../../enums/hts";
import { SecondaryLabel } from "../SecondaryLabel";
import SquareIconButton from "../SqaureIconButton";
import { classNames } from "../../utilities/style";
import { useClassification } from "../../contexts/ClassificationContext";
import { TertiaryText } from "../TertiaryText";
import { Color } from "../../enums/style";
import { IconTab } from "../../interfaces/tab";
import { CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChartPieIcon, CheckBadgeIcon } from "@heroicons/react/16/solid";

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
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <SquareIconButton
          icon={<HomeIcon className="w-5 h-5" />}
          onClick={() => {
            console.log("Back clicked, need to navigate back to home view...");
          }}
        />

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

      <div className="flex flex-col gap-4">
        <div
          className={classNames(
            "flex flex-col rounded-md p-2",
            workflowStep === WorkflowStep.DESCRIPTION && "bg-primary"
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
            <button
              className="btn btn-link btn-primary px-0 gap-0 hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
              onClick={() => {
                setWorkflowStep(WorkflowStep.DESCRIPTION);
              }}
            >
              Edit
            </button>
          </div>
          {productDescription && workflowStep !== WorkflowStep.DESCRIPTION && (
            <TertiaryText value={productDescription} color={Color.WHITE} />
          )}
        </div>
        <div
          className={classNames(
            "flex flex-col rounded-md gap-2 p-2",
            workflowStep === WorkflowStep.ANALYSIS && "bg-primary py-4"
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
            {analysis && (
              <button
                className="btn btn-link btn-primary px-0 gap-0 hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
                onClick={() => {
                  setWorkflowStep(WorkflowStep.ANALYSIS);
                }}
              >
                Edit
              </button>
            )}
          </div>
          {analysis && workflowStep !== WorkflowStep.ANALYSIS && (
            <TertiaryText value={analysis} color={Color.WHITE} />
          )}
        </div>
        <div
          className={classNames(
            "flex items-center rounded-md p-2",
            workflowStep === WorkflowStep.CLASSIFICATION && "bg-primary py-4"
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
