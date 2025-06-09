import { useState } from "react";
import { StepNavigation } from "./workflow/StepNavigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import config from "../config";

interface HowToGuideProps {
  steps: JSX.Element[];
  isOpen: boolean;
  onClose: () => void;
}

export const HowToGuide = ({ steps, isOpen, onClose }: HowToGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="h-screen w-screen fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none">
        <div className="h-full w-full border-2 border-base-content/30 bg-base-100 rounded-lg shadow-xl max-w-5xl relative flex flex-col pointer-events-auto">
          <div className="p-8 flex justify-between">
            <h1 className="text-3xl md:text-4xl text-white font-bold">
              How to use {config.appName}
            </h1>
            <button
              onClick={onClose}
              className="rounded-full border border-base-content/30 h-7 w-7 text-white p-1 hover:bg-base-content/10 flex items-center justify-center"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="h-full grow px-8">
            <div className="h-full">{steps[currentStep]}</div>
          </div>

          <div className="border-t border-neutral-content/20 w-full" />

          {/* Navigation */}
          <div className="shrink px-4">
            <StepNavigation
              previous={
                currentStep > 0
                  ? {
                      label: "Previous",
                      onClick: handlePrevious,
                    }
                  : undefined
              }
              next={
                currentStep < steps.length - 1
                  ? {
                      label: "Next",
                      onClick: handleNext,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};
