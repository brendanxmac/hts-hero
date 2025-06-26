"use client";

import { Bars3BottomLeftIcon } from "@heroicons/react/24/solid";
import { WorkflowStep } from "../../enums/hts";
import { SecondaryLabel } from "../SecondaryLabel";
import { classNames } from "../../utilities/style";
import { useClassification } from "../../contexts/ClassificationContext";
import { TextNavigationStep } from "./TextNavigationStep";
import { ElementsNavigationStep } from "./ElementsNavigationStep";
import { Color } from "../../enums/style";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyTab } from "../../enums/classify";
import { ClassifyTabs } from "../../constants/classify";
import { ConfirmationCard } from "../ConfirmationCard";
import { useState, useRef, useEffect } from "react";
import { TertiaryLabel } from "../TertiaryLabel";
import { PrimaryLabel } from "../PrimaryLabel";

export interface ClassificationNavigationProps {
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
  classificationLevel: number | undefined;
  setClassificationLevel: (level: number | undefined) => void;
  fetchingOptionsOrSuggestions: boolean;
}

export const ClassificationNavigation = ({
  workflowStep,
  setWorkflowStep,
  classificationLevel,
  setClassificationLevel,
  fetchingOptionsOrSuggestions,
}: ClassificationNavigationProps) => {
  const { activeTab, setActiveTab } = useClassifyTab();
  const { classification, clearClassification } = useClassification();
  const { articleDescription, levels } = classification;
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-neutral px-4 py-2">
        <div className="flex items-center gap-2">
          {/* <button
            className="btn btn-link btn-primary px-0 gap-0 hover:text-secondary hover:scale-105 transition-all duration-100 ease-in-out"
            onClick={() => {
              setPage(ClassifyPage.CLASSIFICATIONS);
              setClassification(undefined);
            }}
          >
            <HomeIcon className="w-5 h-5" />
          </button> */}

          {/* <div className="w-px h-6 bg-base-content/20" /> */}

          <div className="grow text-center">
            <PrimaryLabel value="Classify" color={Color.WHITE} />
          </div>
        </div>

        <div
          role="tablist"
          className="tabs tabs-boxed tabs-sm bg-primary-content p-1.5 gap-1 rounded-xl"
        >
          {ClassifyTabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              disabled={fetchingOptionsOrSuggestions}
              onClick={() => setActiveTab(tab.value as ClassifyTab)}
              className={classNames(
                "tab px-1 hover:text-primary hover:scale-105 transition-all duration-100 ease-in-out",
                tab.value === activeTab && "tab-active",
                fetchingOptionsOrSuggestions && "tab-disabled"
              )}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-full flex flex-col gap-6 p-4 overflow-y-scroll"
      >
        <div className="flex flex-col gap-3">
          <SecondaryLabel value="Item" />
          <div ref={descriptionRef}>
            <TextNavigationStep
              title="Item Description"
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

        <div className="flex flex-col">
          <SecondaryLabel value="Selections" />
          <div className="flex flex-col gap-3 pt-3">
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
          <div ref={resultRef} className="flex flex-col gap-3">
            <SecondaryLabel value="Result" />
            <div
              className={classNames(
                "flex flex-col gap-2 p-4 rounded-md border-2 border-neutral hover:cursor-pointer hover:bg-primary/50",
                workflowStep === WorkflowStep.RESULT &&
                  "bg-primary/50 border-primary"
              )}
              onClick={() => {
                if (activeTab !== ClassifyTab.CLASSIFY) {
                  setActiveTab(ClassifyTab.CLASSIFY);
                }
                setWorkflowStep(WorkflowStep.RESULT);
              }}
            >
              <TertiaryLabel value="HTS Code" color={Color.WHITE} />
              <h2 className="text-2xl md:text-3xl text-white font-extrabold">
                {classification.levels[levels.length - 1].selection?.htsno}
              </h2>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-base-100 border-t-2 border-neutral p-4">
        <div className="w-full flex justify-between gap-2">
          <button
            className={classNames(
              "grow btn btn-outline",
              levels.length === 0 && "btn-disabled"
            )}
            disabled={levels.length === 0}
            onClick={() => {
              setShowConfirmation(true);
            }}
          >
            Restart
          </button>

          {/* <button
            className={classNames(
              "grow btn btn-sm btn-secondary",
              !isComplete && "btn-disabled"
            )}
            disabled={!isComplete}
            onClick={() => {
              downloadClassificationReport(classification);
            }}
          >
            Download
          </button> */}
        </div>
      </div>
      {showConfirmation && (
        <ConfirmationCard
          title="Start New Classification?"
          description="To start a new classification click start below. NOTE: Your current classification will NOT be saved if you leave this page. If you completed the classification, be sure to download it first"
          confirmText="Start"
          cancelText="Close"
          onConfirm={() => {
            clearClassification();
            setWorkflowStep(WorkflowStep.DESCRIPTION);
            setClassificationLevel(undefined);
            setShowConfirmation(false);
          }}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};
