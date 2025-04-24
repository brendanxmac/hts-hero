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
import { IconTab } from "../../interfaces/tab";
import { ChartPieIcon, ChevronLeftIcon } from "@heroicons/react/16/solid";
import { TextNavigationStep } from "./TextNavigationStep";
import { ClassificationLevelNavigationStep } from "./ElementsNavigationStep";

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
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
}

export const ClassificationNavigation = ({
  activeTab,
  setActiveTab,
  workflowStep,
  setWorkflowStep,
  classificationLevel,
  setClassificationLevel,
}: ClassificationNavigationProps) => {
  const { classification } = useClassification();
  const { productDescription, analysis, progressionLevels } = classification;

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

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <SecondaryLabel value="Article Details" />
          <TextNavigationStep
            title="Description"
            text={productDescription}
            active={workflowStep === WorkflowStep.DESCRIPTION}
            icon={
              <Bars3BottomLeftIcon
                className={classNames(
                  "w-5 h-5",
                  workflowStep === WorkflowStep.DESCRIPTION
                    ? "text-white"
                    : "text-content-neutral"
                )}
              />
            }
            button={{
              label: "Edit",
              onClick: () => setWorkflowStep(WorkflowStep.DESCRIPTION),
            }}
          />
          <TextNavigationStep
            title="Analysis"
            text={analysis}
            active={workflowStep === WorkflowStep.ANALYSIS}
            icon={
              <ChartPieIcon
                className={classNames(
                  "w-5 h-5",
                  workflowStep === WorkflowStep.ANALYSIS
                    ? "text-white"
                    : "text-content-neutral"
                )}
              />
            }
            button={{
              label: "Edit",
              onClick: () => setWorkflowStep(WorkflowStep.ANALYSIS),
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <SecondaryLabel value="Classification Progress" />
          {progressionLevels.map((level, index) => (
            <ClassificationLevelNavigationStep
              key={index}
              classificationLevel={level}
              active={
                workflowStep === WorkflowStep.CLASSIFICATION &&
                classificationLevel === index
              }
              onClick={() => {
                if (workflowStep !== WorkflowStep.CLASSIFICATION) {
                  setWorkflowStep(WorkflowStep.CLASSIFICATION);
                }
                setClassificationLevel(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
