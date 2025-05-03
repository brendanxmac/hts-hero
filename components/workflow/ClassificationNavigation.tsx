"use client";

import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import { WorkflowStep } from "../../enums/hts";
import { SecondaryLabel } from "../SecondaryLabel";
import { classNames } from "../../utilities/style";
import { useClassification } from "../../contexts/ClassificationContext";
import { ChartPieIcon } from "@heroicons/react/16/solid";
import { HomeIcon } from "@heroicons/react/24/solid";
import { TextNavigationStep } from "./TextNavigationStep";
import { ElementsNavigationStep } from "./ElementsNavigationStep";
import { Color } from "../../enums/style";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyPage, ClassifyTab } from "../../enums/classify";
import { ClassifyTabs } from "../../constants/classify";

export interface ClassificationNavigationProps {
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
  setPage: (page: ClassifyPage) => void;
}

export const ClassificationNavigation = ({
  workflowStep,
  setWorkflowStep,
  classificationLevel,
  setClassificationLevel,
  setPage,
}: ClassificationNavigationProps) => {
  const { activeTab, setActiveTab } = useClassifyTab();
  const { classification } = useClassification();
  const { articleDescription, articleAnalysis, levels } = classification;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-neutral px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-link btn-primary px-0 gap-0 hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
            onClick={() => {
              setPage(ClassifyPage.CLASSIFICATIONS);
            }}
          >
            <HomeIcon className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-base-content/20" />

          <div className="grow text-center">
            <SecondaryLabel value="New Classification" color={Color.WHITE} />
          </div>
        </div>

        <div
          role="tablist"
          className="tabs tabs-boxed tabs-sm bg-primary-content p-1.5 gap-1 rounded-xl"
        >
          {ClassifyTabs.map((tab) => (
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

      <div className="h-full flex flex-col gap-6 p-4 overflow-y-scroll">
        <div className="flex flex-col gap-8">
          <TextNavigationStep
            large
            title="Article Description"
            text={articleDescription}
            active={workflowStep === WorkflowStep.DESCRIPTION}
            icon={
              <Bars3BottomLeftIcon
                className={classNames(
                  "w-5 h-5 m-1",
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
            large
            title="Article Analysis"
            text={articleAnalysis}
            active={workflowStep === WorkflowStep.ANALYSIS}
            icon={
              <ChartPieIcon
                className={classNames(
                  "w-5 h-5 m-1",
                  workflowStep === WorkflowStep.ANALYSIS
                    ? "text-white"
                    : "text-content-neutral"
                )}
              />
            }
            showButton={Boolean(articleDescription)}
            button={{
              label: articleAnalysis.length === 0 ? "Add" : "Edit",
              onClick: () => setWorkflowStep(WorkflowStep.ANALYSIS),
            }}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <SecondaryLabel value="Classification Progress" />
          <div className="flex flex-col gap-4 py-3">
            {levels.map((level, index) => (
              <ElementsNavigationStep
                key={index}
                index={index}
                classificationProgression={level}
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
    </div>
  );
};
