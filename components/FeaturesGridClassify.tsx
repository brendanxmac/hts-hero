/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface HSCodeCard {
  title: string;
  subtitle: string;
}

const FeaturesGridClassify = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCards, setShowCards] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const itemDescription = "Carbon fiber bicycle frame made for road bikes";

  const hsCodeCards: HSCodeCard[] = [
    {
      title: "8714",
      subtitle: "Parts and accessories of vehicles of headings 8711 to 8713:",
    },
    {
      title: "8712.00",
      subtitle:
        "Bicycles and other cycles (including delivery tricycles), not motorized:",
    },
    {
      title: "9506",
      subtitle:
        "Articles and equipment for general physical exercise, gymnastics, athletics, other sports (including table-tennis) or outdoor games, not specified or included elsewhere in this chapter; swimming pools and wading pools; parts and accessories thereof:",
    },
  ];

  const startProcessing = () => {
    setIsProcessing(true);
    setProgress(0);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Move to step 2 when progress is complete
          setTimeout(() => {
            setCurrentStep(2);
            setShowCards(true);
            setIsProcessing(false);
          }, 300);
          return 100;
        }
        return prev + 2; // Increase by 4% every 30ms for faster animation
      });
    }, 30);
  };

  // Step 1: Typing animation
  useEffect(() => {
    if (currentStep === 1) {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < itemDescription.length) {
          setTypedText(itemDescription.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          // Mark typing as complete
          setIsTypingComplete(true);
          // Start processing after typing is complete
          setTimeout(() => {
            startProcessing();
          }, 500);
        }
      }, 50); // Faster typing - 50ms per character instead of 100ms

      return () => clearInterval(typeInterval);
    }
  }, [currentStep, itemDescription]);

  // Step 2: Card animations
  useEffect(() => {
    if (currentStep === 2 && showCards) {
      // Auto-select the first card after all cards are shown
      const selectTimer = setTimeout(() => {
        setSelectedCard(0);
      }, 2000); // Wait 2 seconds after cards appear

      return () => clearTimeout(selectTimer);
    }
  }, [currentStep, showCards]);

  const resetAnimation = () => {
    setCurrentStep(1);
    setTypedText("");
    setIsTypingComplete(false);
    setIsProcessing(false);
    setProgress(0);
    setShowCards(false);
    setSelectedCard(null);
  };

  // Restart animation every 15 seconds
  useEffect(() => {
    const restartTimer = setInterval(resetAnimation, 10000);
    return () => clearInterval(restartTimer);
  }, []);

  return (
    <section className="flex justify-center items-center w-full bg-base-200 text-base-content px-6 py-10 lg:py-16">
      <div className="w-full flex flex-col max-w-7xl lg:min-w-5xl gap-4 sm:gap-8">
        <div className="flex flex-col gap-2 md:gap-4 text-center lg:text-left lg:flex-1 items-center">
          <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-7xl tracking-tight md:-mb-4">
            Classify Anything in{" "}
            <span className="bg-primary px-2 text-base-300 transform -rotate-1 inline-block">
              Minutes
            </span>
          </h1>
          <p className="text-sm md:text-lg lg:text-xl text-neutral-300 leading-relaxed max-w-5xl mx-auto md:my-4">
            The classification assistant designed to make customs brokers
            unreasonably productive
          </p>

          <div className="flex justify-center lg:justify-start">
            <Link className="btn btn-wide btn-primary" href="/app">
              Try it now!
            </Link>
          </div>
        </div>

        {/* 2-Step Animation Demo */}
        <div className="w-full max-w-6xl mx-auto bg-base-100 rounded-2xl p-8 border-2 border-base-content/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Enter Item Description */}
            <div className="bg-base-300 rounded-xl p-6 border-2 border-base-content/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full h-8 w-8 bg-primary text-base-300 text-sm font-semibold flex items-center justify-center">
                  1
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Enter Item Description
                </h3>
              </div>
              <div className="bg-base-100 rounded-lg p-6 min-h-[200px] flex flex-col gap-4">
                <div className="flex-1 flex items-center">
                  <div className="w-full">
                    <label className="text-sm font-medium text-base-content/80 mb-2 block">
                      Item Description
                    </label>
                    <div className="bg-base-200 border border-base-content/20 rounded-lg p-4 min-h-[60px] flex items-center">
                      <div className="text-base-content text-base font-medium">
                        {typedText}
                        {currentStep === 1 && !isTypingComplete && (
                          <span className="animate-pulse text-primary ml-1">
                            |
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Reserved space for progress bar - always present to prevent layout shift */}
                <div className="h-[60px] flex flex-col items-center justify-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="w-full bg-base-300 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-75 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-base-content/60">
                        {progress}%
                      </span>
                    </div>
                  ) : (
                    <div className="h-[60px]"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: See HS Codes */}
            <div className="bg-base-300 rounded-xl p-6 border-2 border-base-content/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full h-8 w-8 bg-primary text-base-300 text-sm font-semibold flex items-center justify-center">
                  2
                </div>
                <h3 className="text-lg font-semibold text-white">
                  See HS Codes
                </h3>
              </div>
              <div className="space-y-3">
                {hsCodeCards.map((card, index) => (
                  <div
                    key={index}
                    className={`bg-base-100 rounded-lg p-3 transition-all duration-500 ${
                      showCards
                        ? "opacity-100 transform translate-y-0"
                        : "opacity-0 transform translate-y-4"
                    } ${
                      selectedCard === index
                        ? "ring-2 ring-primary bg-primary/10"
                        : ""
                    }`}
                    style={{
                      transitionDelay: showCards ? `${index * 200}ms` : "0ms",
                    }}
                  >
                    <div className="font-bold text-primary text-sm">
                      {card.title}
                    </div>
                    <div className="text-xs text-base-content/80 mt-1">
                      {card.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGridClassify;
