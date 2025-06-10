import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { StepNavigation } from "./workflow/StepNavigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import config from "../config";
import { useGuide } from "@/contexts/GuideContext";
import { GuideName } from "@/types/guides";
import { HowToStep } from "./HowToStep";

interface HowToGuideProps {
  guideName: GuideName;
}

export const HowToGuide = ({ guideName }: HowToGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const pathname = usePathname();
  const { showGuide, hideGuide, isGuideVisible, guideSteps, guides } =
    useGuide();

  useEffect(() => {
    // Ensure code only runs client-side
    if (typeof window === "undefined") return;

    // Find the guide config for the current route
    const guideConfig = guides.find((config) =>
      config.routes?.includes(pathname)
    );

    if (guideConfig) {
      const storageKey = `guide-${guideConfig.name.toLowerCase()}`;
      const guideRaw = localStorage.getItem(storageKey);

      if (!guideRaw) {
        showGuide(guideConfig.name);
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            seen: true,
            expiresAt:
              Date.now() + guideConfig.daysUntilShowAgain * 24 * 60 * 60 * 1000,
          })
        );
        return;
      }

      try {
        const guide = JSON.parse(guideRaw);
        const hasExpired = Date.now() > guide.expiresAt;

        if (hasExpired) {
          showGuide(guideConfig.name);
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              seen: false,
              expiresAt:
                Date.now() +
                guideConfig.daysUntilShowAgain * 24 * 60 * 60 * 1000,
            })
          );
        }
      } catch {
        // If data is corrupted, show the guide
        showGuide(guideConfig.name);
      }
    }
  }, [pathname, showGuide, guides]);

  if (!isGuideVisible) return null;

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      hideGuide();
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
        onClick={hideGuide}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none">
        <div className="w-full max-w-5xl max-h-[90vh] h-full border-2 border-base-content/30 bg-base-100 rounded-lg shadow-xl relative flex flex-col pointer-events-auto">
          <div className="p-8 flex justify-between">
            <h1 className="text-3xl md:text-4xl text-white font-bold">
              How to use {config.appName}
            </h1>
            <button
              onClick={hideGuide}
              className="rounded-full border border-base-content/30 h-7 w-7 text-white p-1 hover:bg-base-content/10 flex items-center justify-center"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 px-8 overflow-y-auto">
            <div className="h-full">
              <HowToStep step={guideSteps[currentStep]} />
            </div>
          </div>

          <div className="border-t border-neutral-content/20 w-full" />

          {/* Navigation */}
          <div className="px-4 sticky bottom-0 bg-base-100 rounded-b-lg z-10">
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
                currentStep < guideSteps.length - 1
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
