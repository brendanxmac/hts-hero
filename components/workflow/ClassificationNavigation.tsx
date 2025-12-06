"use client";

import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/16/solid";
import { WorkflowStep } from "../../enums/hts";
import { useClassification } from "../../contexts/ClassificationContext";
import { TextNavigationStep } from "./TextNavigationStep";
import { ElementsNavigationStep } from "./ElementsNavigationStep";
import { useClassifyTab } from "../../contexts/ClassifyTabContext";
import { ClassifyPage, ClassifyTab } from "../../enums/classify";
import { ClassifyTabs } from "../../constants/classify";
import { useRef, useEffect } from "react";

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
    <div className="h-full flex flex-col bg-gradient-to-b from-base-200 via-base-200 to-base-300/50">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-base-content/5">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col p-4 gap-3">
          <div className="flex justify-between items-center">
            <button
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-content/5 transition-all duration-200"
              onClick={() => {
                setActiveTab(ClassifyTab.CLASSIFY);
                setPage(ClassifyPage.CLASSIFICATIONS);
              }}
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Classifications</span>
            </button>

            <div className="flex p-1 gap-1 bg-base-100/60 rounded-xl border border-base-content/5">
              {ClassifyTabs.map((tab) => (
                <button
                  key={tab.value}
                  disabled={fetchingOptionsOrSuggestions}
                  onClick={() => setActiveTab(tab.value as ClassifyTab)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    tab.value === activeTab
                      ? "bg-base-100 text-primary shadow-sm"
                      : "text-base-content/50 hover:text-base-content hover:bg-base-100/50"
                  } ${fetchingOptionsOrSuggestions ? "opacity-50 cursor-not-allowed" : ""} ${
                    tab.value === ClassifyTab.CLASSIFY &&
                    activeTab !== ClassifyTab.CLASSIFY
                      ? "animate-pulse bg-warning/20 text-warning"
                      : ""
                  }`}
                >
                  {tab.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col gap-5 py-4 px-4 overflow-y-auto"
      >
        {/* Item Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-primary/40" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">
              Item
            </span>
          </div>
          <div ref={descriptionRef}>
            <TextNavigationStep
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
        </div>

        {/* Selections Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-primary/40" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">
              Your Selections
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {levels &&
              levels.map((level, index) => (
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

        {/* Result Section */}
        {classification?.isComplete && (
          <div ref={resultRef} className="flex flex-col gap-2 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-success/40" />
              <span className="text-xs font-semibold uppercase tracking-widest text-success/80">
                Result & Tariff
              </span>
            </div>
            <div
              className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${
                workflowStep === WorkflowStep.RESULT
                  ? "bg-gradient-to-br from-success/15 to-success/5 border-2 border-success/40 shadow-lg shadow-success/10"
                  : "bg-base-100 border border-base-content/10 hover:border-success/30 hover:shadow-md"
              }`}
              onClick={() => {
                if (activeTab !== ClassifyTab.CLASSIFY) {
                  setActiveTab(ClassifyTab.CLASSIFY);
                }
                setWorkflowStep(WorkflowStep.RESULT);
              }}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircleIcon className="w-4 h-4 text-success" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-success">
                    HTS Code
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-base-content">
                  {classification?.levels[levels.length - 1]?.selection?.htsno}
                </h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
