"use client";

import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { WorkflowStep } from "../../enums/hts";
import { classNames } from "../../utilities/style";
import { useClassification } from "../../contexts/ClassificationContext";
import { TextNavigationStep } from "./TextNavigationStep";
import { ElementsNavigationStep } from "./ElementsNavigationStep";
import { Color } from "../../enums/style";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyPage, ClassifyTab } from "../../enums/classify";
import { ClassifyTabs } from "../../constants/classify";
import { useRef, useEffect } from "react";
import { TertiaryLabel } from "../TertiaryLabel";
import { PrimaryLabel } from "../PrimaryLabel";

export interface ClassificationNavigationProps {
  setPage: (page: ClassifyPage) => void;
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
  fetchingOptionsOrSuggestions: boolean;
}

export const ClassificationNavigation = ({
  setPage,
  workflowStep,
  setWorkflowStep,
  classificationLevel,
  setClassificationLevel,
  fetchingOptionsOrSuggestions,
}: ClassificationNavigationProps) => {
  const { activeTab, setActiveTab } = useClassifyTab();
  const { classification } = useClassification();
  const { articleDescription, levels } = classification;
  const containerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const levelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let elementToScrollTo: HTMLElement | null = null;

    if (workflowStep === WorkflowStep.DESCRIPTION) {
      elementToScrollTo = descriptionRef.current;
    } else if (
      workflowStep === WorkflowStep.CLASSIFICATION &&
      classificationLevel !== undefined
    ) {
      elementToScrollTo = levelRefs.current[classificationLevel] || null;
    } else if (workflowStep === WorkflowStep.RESULT) {
      elementToScrollTo = resultRef.current;
    }

    if (elementToScrollTo) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = elementToScrollTo.getBoundingClientRect();

      // Calculate if the element is outside the visible area
      const isAbove = elementRect.top < containerRect.top;
      const isBelow = elementRect.bottom > containerRect.bottom;

      if (isAbove || isBelow) {
        elementToScrollTo.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [workflowStep, classificationLevel]);

  return (
    <div className="h-full flex flex-col overflow-y-scroll">
      {/* Header */}
      <div className="flex flex-col p-4 gap-2">
        <div className="z-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="btn btn-xs btn-primary gap-1"
              onClick={() => {
                setActiveTab(ClassifyTab.CLASSIFY);
                setPage(ClassifyPage.CLASSIFICATIONS);
              }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              &nbsp;Classifications
            </button>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div
              role="tablist"
              className="tabs tabs-sm tabs-boxed bg-primary/30 rounded-xl"
            >
              {ClassifyTabs.map((tab) => (
                <button
                  key={tab.value}
                  role="tab"
                  disabled={fetchingOptionsOrSuggestions}
                  onClick={() => setActiveTab(tab.value as ClassifyTab)}
                  className={classNames(
                    "tab transition-all duration-200 ease-in text-white font-semibold",
                    tab.value === activeTab && "tab-active",
                    fetchingOptionsOrSuggestions && "tab-disabled"
                  )}
                >
                  {tab.icon}
                  {/* {tab.text && tab.text} */}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* <h2 className="text-2xl text-neutral-50 font-bold">
          Classification Summary
        </h2> */}
      </div>

      <div ref={containerRef} className="h-full flex flex-col gap-6 py-2 px-4">
        <div className="flex flex-col gap-3">
          <PrimaryLabel value="Item" color={Color.WHITE} />
          <div ref={descriptionRef}>
            <TextNavigationStep
              large
              title="Description"
              text={articleDescription}
              active={workflowStep === WorkflowStep.DESCRIPTION}
              button={{
                label: "Edit",
                onClick: () => {
                  if (activeTab !== ClassifyTab.CLASSIFY) {
                    setActiveTab(ClassifyTab.CLASSIFY);
                  }
                  setWorkflowStep(WorkflowStep.DESCRIPTION);
                },
              }}
            />
          </div>
          {/* <TextNavigationStep
            title="Item Analysis"
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
          /> */}
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryLabel value="Selections" color={Color.WHITE} />
          <div className="flex flex-col gap-3">
            {levels.map((level, index) => (
              <div
                key={index}
                ref={(el) => {
                  levelRefs.current[index] = el;
                }}
              >
                <ElementsNavigationStep
                  index={index}
                  classificationProgression={level}
                  active={
                    workflowStep === WorkflowStep.CLASSIFICATION &&
                    classificationLevel === index
                  }
                  onClick={() => {
                    if (activeTab !== ClassifyTab.CLASSIFY) {
                      setActiveTab(ClassifyTab.CLASSIFY);
                    }

                    setWorkflowStep(WorkflowStep.CLASSIFICATION);
                    setClassificationLevel(index);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {classification.isComplete && (
          <div ref={resultRef} className="flex flex-col gap-3 pb-4">
            <PrimaryLabel value="Result" color={Color.WHITE} />
            <div
              className={classNames(
                "flex flex-col gap-1 p-4 rounded-md border-2 border-neutral-content/40 hover:scale-[1.02] transition-all duration-200 ease-in-out hover:cursor-pointer hover:bg-base-300",
                workflowStep === WorkflowStep.RESULT &&
                  "bg-primary border border-primary hover:bg-primary"
              )}
              onClick={() => {
                if (activeTab !== ClassifyTab.CLASSIFY) {
                  setActiveTab(ClassifyTab.CLASSIFY);
                }
                setWorkflowStep(WorkflowStep.RESULT);
              }}
            >
              <TertiaryLabel
                value="HTS Code"
                color={
                  workflowStep === WorkflowStep.RESULT
                    ? Color.BLACK
                    : Color.WHITE
                }
              />
              <h2
                className={classNames(
                  "text-2xl md:text-3xl font-extrabold",
                  workflowStep === WorkflowStep.RESULT
                    ? "text-black"
                    : "text-white"
                )}
              >
                {classification.levels[levels.length - 1].selection?.htsno}
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
