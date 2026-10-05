"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TourStep {
  target: string;
  title: string;
  description: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: "stocks",
    title: "Stock Exchange Terminal",
    description:
      "The primary trading desk. Monitor real-time prices, inspect historical valuations, and execute instant buy and sell orders against current market liquidity.",
  },
  {
    target: "news",
    title: "Market Intelligence Terminal",
    description:
      "Real-time macroeconomic intelligence feed. Breaking industry reports and policy announcements directly drive algorithmic stock price fluctuations.",
  },
  {
    target: "bank",
    title: "Central Bank and Portfolio",
    description:
      "Account liquidity headquarters. Track liquid cash balances, total asset holdings, borrowing terms, and aggregate portfolio net worth in real time.",
  },
  {
    target: "scoreboard",
    title: "Live Competitive Leaderboard",
    description:
      "Real-time ranking of market participants. Continuously computed based on portfolio market capitalization, liquid reserves, and realized asset valuations.",
  },
  {
    target: "session",
    title: "Session Control and Workspace",
    description:
      "Tracks remaining trading window duration. All application windows can be moved, resized, maximized, and stacked to configure custom desktop layouts.",
  },
];

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepIndex: number, target: string) => void;
}

export default function FeatureTour({ isOpen, onClose, onStepChange }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      onStepChange?.(currentStep, TOUR_STEPS[currentStep].target);
    }
  }, [currentStep, isOpen, onStepChange]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepChange?.(next, TOUR_STEPS[next].target);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onStepChange?.(prev, TOUR_STEPS[prev].target);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem("feature_tour_completed", "true");
    } catch {}
    onClose();
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[100] flex items-end sm:items-end justify-center sm:justify-end p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-auto w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl p-5 text-neutral-100 flex flex-col gap-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
            <span className="font-mono text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Feature Tour — Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button
              type="button"
              onClick={handleComplete}
              className="text-xs text-neutral-500 hover:text-neutral-200 transition"
            >
              Skip
            </button>
          </div>

          {/* Content */}
          <div className="space-y-1.5 py-1">
            <h2 className="text-base font-semibold tracking-tight text-white">
              {step.title}
            </h2>
            <p className="text-xs leading-relaxed text-neutral-300">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-900 mt-1">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentStep(idx);
                    onStepChange?.(idx, TOUR_STEPS[idx].target);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "w-5 bg-white"
                      : "w-1.5 bg-neutral-700 hover:bg-neutral-500"
                  }`}
                  aria-label={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3 py-1 text-xs border border-neutral-700 hover:bg-neutral-900 text-neutral-300 rounded transition"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="px-3.5 py-1 text-xs bg-white text-black font-semibold rounded hover:bg-neutral-200 transition"
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
