"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TourStep {
  target: string;
  tag: string;
  title: string;
  description: string;
  camera: {
    scale: number;
    x: number;
    y: number;
  };
  isCentered?: boolean;
  buttonText?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: "intro",
    tag: "ORIENTATION",
    title: "Interactive Trading Workspace Tour",
    description:
      "Welcome to the institutional trading platform. This guided tour will take you through each terminal component with live camera zoom and focus.",
    camera: { scale: 1, x: 0, y: 0 },
    isCentered: true,
    buttonText: "Begin Tour",
  },
  {
    target: "stocks",
    tag: "TERMINAL 01",
    title: "Stock Exchange Terminal",
    description:
      "The primary trading desk. Buy and sell equities across 17 listed corporate entities with real-time valuation updates and instant liquidity execution.",
    camera: { scale: 1.12, x: 50, y: -20 },
    isCentered: false,
  },
  {
    target: "news",
    tag: "TERMINAL 02",
    title: "Market Intelligence Terminal",
    description:
      "Live macroeconomic and corporate intelligence feed. Dispatched headlines apply deterministic and stochastic price shocks to listed stocks in real time.",
    camera: { scale: 1.15, x: -70, y: -30 },
    isCentered: false,
  },
  {
    target: "bank",
    tag: "TERMINAL 03",
    title: "Central Bank & Portfolio",
    description:
      "Account liquidity center. Monitor liquid cash reserves, loan commitments, interest rate terms, and aggregate portfolio net worth.",
    camera: { scale: 1.12, x: 40, y: 15 },
    isCentered: false,
  },
  {
    target: "scoreboard",
    tag: "TERMINAL 04",
    title: "Competitive Leaderboard",
    description:
      "Real-time ranking of market participants based on continuously computed mark-to-market valuations and cumulative asset holdings.",
    camera: { scale: 1.12, x: -40, y: 20 },
    isCentered: false,
  },
  {
    target: "session",
    tag: "CONTROLS",
    title: "Session Timer & Application Dock",
    description:
      "Monitors active trading window duration. Windows can be freely dragged, resized, minimized, or stacked from the bottom application dock.",
    camera: { scale: 1.08, x: 0, y: -50 },
    isCentered: false,
  },
  {
    target: "complete",
    tag: "READY",
    title: "Tour Complete — Workspace Active",
    description:
      "Your terminal environment is fully operational. Explore the markets with your sample demo balance of $250,000.",
    camera: { scale: 1, x: 0, y: 0 },
    isCentered: true,
    buttonText: "Start Trading",
  },
];

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepIndex: number, target: string, camera: { scale: number; x: number; y: number }) => void;
}

export default function FeatureTour({ isOpen, onClose, onStepChange }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const step = TOUR_STEPS[currentStep];
      onStepChange?.(currentStep, step.target, step.camera);
    }
  }, [currentStep, isOpen, onStepChange]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      const step = TOUR_STEPS[next];
      onStepChange?.(next, step.target, step.camera);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      const step = TOUR_STEPS[prev];
      onStepChange?.(prev, step.target, step.camera);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem("feature_tour_completed", "true");
    } catch {}
    setCurrentStep(0);
    onStepChange?.(0, "complete", { scale: 1, x: 0, y: 0 });
    onClose();
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isCentered = !!step.isCentered;

  return (
    <AnimatePresence>
      <div
        className={`fixed inset-0 z-[100] transition-colors duration-500 ${
          isCentered
            ? "flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px] pointer-events-auto"
            : "pointer-events-none flex items-end justify-center sm:justify-end p-4 sm:p-8"
        }`}
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: isCentered ? 0 : 20, scale: isCentered ? 0.94 : 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isCentered ? 0 : 20, scale: isCentered ? 0.94 : 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`pointer-events-auto w-full bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl p-6 text-neutral-100 flex flex-col gap-3.5 ${
            isCentered ? "max-w-lg" : "max-w-md"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold tracking-wider bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded uppercase">
                {step.tag}
              </span>
              <span className="font-mono text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={handleComplete}
              className="text-xs text-neutral-500 hover:text-neutral-200 transition"
            >
              Skip Tour
            </button>
          </div>

          {/* Pointer Target Banner (when not centered) */}
          {!isCentered && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="tracking-wide">CAMERA FOCUSED ON {step.title.toUpperCase()}</span>
            </motion.div>
          )}

          {/* Content */}
          <div className="space-y-2 py-1">
            <h2 className={`font-semibold tracking-tight text-white ${isCentered ? "text-xl" : "text-base"}`}>
              {step.title}
            </h2>
            <p className="text-xs leading-relaxed text-neutral-300">
              {step.description}
            </p>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-900 mt-1">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentStep(idx);
                    const s = TOUR_STEPS[idx];
                    onStepChange?.(idx, s.target, s.camera);
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
                  className="px-3.5 py-1 text-xs border border-neutral-700 hover:bg-neutral-900 text-neutral-300 rounded transition"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1 text-xs bg-white text-black font-semibold rounded hover:bg-neutral-200 transition"
              >
                {step.buttonText || (currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
