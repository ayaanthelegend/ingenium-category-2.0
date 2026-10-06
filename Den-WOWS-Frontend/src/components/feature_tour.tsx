"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TourStep {
  target: string;
  title: string;
  description: string;
  isCentered?: boolean;
  buttonText?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: "intro",
    title: "Welcome to Goldman's Gambit",
    description:
      "Explore the desktop trading platform. We'll show you how to buy stocks, follow live news, and climb the leaderboard.",
    isCentered: true,
    buttonText: "Begin Tour",
  },
  {
    target: "stocks",
    title: "Stock Exchange",
    description:
      "Trade shares across active companies in real time. Watch live price charts and execute buys or sells instantly.",
    isCentered: false,
  },
  {
    target: "news",
    title: "Live News Feed",
    description:
      "Stay on top of breaking market headlines. News events shift stock prices immediately, creating new trading opportunities.",
    isCentered: false,
  },
  {
    target: "bank",
    title: "Bank & Portfolio",
    description:
      "Manage your cash balance, take out loans, and monitor your total net worth as your holdings grow.",
    isCentered: false,
  },
  {
    target: "scoreboard",
    title: "Competitive Leaderboard",
    description:
      "Track your rank against competing traders in real time. Grow your portfolio to claim the top spot.",
    isCentered: false,
  },
  {
    target: "session",
    title: "Session Timer & Dock",
    description:
      "See how long you've been trading, and use the dock at the bottom to open, switch, or minimize your windows.",
    isCentered: false,
  },
  {
    target: "complete",
    title: "You're Ready to Trade",
    description:
      "Your workspace is ready. Jump into the market with your starting balance and begin building your fortune.",
    isCentered: true,
    buttonText: "Start Trading",
  },
];

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (
    stepIndex: number,
    target: string,
    camera: { scale: number; x: number; y: number }
  ) => void;
  onTargetChange?: (target: string) => void;
  currentCamera?: { scale: number; x: number; y: number };
}

/**
 * Extracts instantaneous scale and translation of the desktop container from computed style matrix.
 */
function getContainerCurrentTransform(container: HTMLElement | null): { scale: number; x: number; y: number } {
  if (!container || typeof window === "undefined") return { scale: 1, x: 0, y: 0 };
  const style = window.getComputedStyle(container);
  const transform = style.transform || (style as unknown as Record<string, string>).webkitTransform;
  if (!transform || transform === "none") {
    return { scale: 1, x: 0, y: 0 };
  }
  const match2d = transform.match(/^matrix\(([^)]+)\)$/);
  if (match2d) {
    const parts = match2d[1].split(",").map((s) => parseFloat(s.trim()));
    return { scale: parts[0] || 1, x: parts[4] || 0, y: parts[5] || 0 };
  }
  const match3d = transform.match(/^matrix3d\(([^)]+)\)$/);
  if (match3d) {
    const parts = match3d[1].split(",").map((s) => parseFloat(s.trim()));
    return { scale: parts[0] || 1, x: parts[12] || 0, y: parts[13] || 0 };
  }
  return { scale: 1, x: 0, y: 0 };
}

export default function FeatureTour({
  isOpen,
  onClose,
  onStepChange,
  onTargetChange,
}: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hasPositioned, setHasPositioned] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const calculateGeometry = useCallback((stepIdx: number, retry = 0) => {
    if (typeof window === "undefined") return;
    const step = TOUR_STEPS[stepIdx];
    if (!step) return;

    if (step.isCentered) {
      onStepChange?.(stepIdx, step.target, { scale: 1, x: 0, y: 0 });
      setHasPositioned(true);
      return;
    }

    // Identify target element(s)
    let elements: HTMLElement[] = [];
    if (step.target === "session") {
      elements = Array.from(document.querySelectorAll<HTMLElement>('[data-tour-target="session"]'));
      if (elements.length === 0) {
        const dock = document.querySelector<HTMLElement>('[data-tour="dock"]');
        const timer = document.querySelector<HTMLElement>('[data-tour="session-timer"]');
        if (dock) elements.push(dock);
        if (timer) elements.push(timer);
      }
    } else {
      const el =
        document.querySelector<HTMLElement>(`[data-tour-target="${step.target}"]`) ||
        document.getElementById(`window-${step.target}`);
      if (el) elements.push(el);
    }

    // If target element is not in DOM yet, retry next animation frame (up to 8 times)
    if (elements.length === 0) {
      if (retry < 8) {
        rafIdRef.current = requestAnimationFrame(() => calculateGeometry(stepIdx, retry + 1));
      }
      return;
    }

    const container = document.getElementById("desktop-container");
    const curTransform = getContainerCurrentTransform(container);
    const curScale = curTransform.scale > 0 ? curTransform.scale : 1;
    const curX = curTransform.x;
    const curY = curTransform.y;

    // Calculate untransformed union bounding box
    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;

    for (const el of elements) {
      const r = el.getBoundingClientRect();
      const uL = (r.left - curX) / curScale;
      const uT = (r.top - curY) / curScale;
      const uR = (r.right - curX) / curScale;
      const uB = (r.bottom - curY) / curScale;

      minLeft = Math.min(minLeft, uL);
      minTop = Math.min(minTop, uT);
      maxRight = Math.max(maxRight, uR);
      maxBottom = Math.max(maxBottom, uB);
    }

    const uWidth = Math.max(10, maxRight - minLeft);
    const uHeight = Math.max(10, maxBottom - minTop);
    const uCenterX = minLeft + uWidth / 2;
    const uCenterY = minTop + uHeight / 2;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Comfortable framing padding around target
    const padX = Math.max(60, Math.min(160, vw * 0.12));
    const padY = Math.max(60, Math.min(140, vh * 0.12));

    const availW = Math.max(100, vw - 2 * padX);
    const availH = Math.max(100, vh - 2 * padY);

    const scaleX = availW / uWidth;
    const scaleY = availH / uHeight;
    const fitScale = Math.min(scaleX, scaleY);

    // Clamp zoom: never below 1x, never exceeds sensible max (1.6x)
    const targetScale = Math.max(1.0, Math.min(fitScale, 1.6));

    // Derive translation so target center is placed at viewport center
    const targetX = vw / 2 - targetScale * uCenterX;
    const targetY = vh / 2 - targetScale * uCenterY;

    // Derived on-screen box for the target once camera arrives
    const targetScreenLeft = targetScale * minLeft + targetX;
    const targetScreenTop = targetScale * minTop + targetY;
    const targetScreenWidth = targetScale * uWidth;
    const targetScreenHeight = targetScale * uHeight;
    const targetScreenRight = targetScreenLeft + targetScreenWidth;
    const targetScreenBottom = targetScreenTop + targetScreenHeight;
    const targetScreenCenterX = targetScreenLeft + targetScreenWidth / 2;
    const targetScreenCenterY = targetScreenTop + targetScreenHeight / 2;

    const cardW = Math.min(420, vw - 32);
    const cardH = cardRef.current ? cardRef.current.offsetHeight : 210;
    const margin = 20;
    const gap = 18;

    // Flip logic: Bottom -> Top -> Right -> Left
    const fitsBottom = targetScreenBottom + gap + cardH + margin <= vh;
    const fitsTop = targetScreenTop - gap - cardH >= margin;
    const fitsRight = targetScreenRight + gap + cardW + margin <= vw;
    const fitsLeft = targetScreenLeft - gap - cardW >= margin;

    let posX = 0;
    let posY = 0;

    if (fitsBottom) {
      posY = targetScreenBottom + gap;
      posX = Math.max(margin, Math.min(targetScreenCenterX - cardW / 2, vw - cardW - margin));
    } else if (fitsTop) {
      posY = targetScreenTop - gap - cardH;
      posX = Math.max(margin, Math.min(targetScreenCenterX - cardW / 2, vw - cardW - margin));
    } else if (fitsRight) {
      posX = targetScreenRight + gap;
      posY = Math.max(margin, Math.min(targetScreenCenterY - cardH / 2, vh - cardH - margin));
    } else if (fitsLeft) {
      posX = targetScreenLeft - gap - cardW;
      posY = Math.max(margin, Math.min(targetScreenCenterY - cardH / 2, vh - cardH - margin));
    } else {
      // Best fit with maximum vertical space
      const spaceBelow = vh - targetScreenBottom;
      const spaceAbove = targetScreenTop;
      if (spaceBelow >= spaceAbove) {
        posY = Math.max(margin, Math.min(targetScreenBottom + gap, vh - cardH - margin));
      } else {
        posY = Math.max(margin, Math.min(targetScreenTop - gap - cardH, vh - cardH - margin));
      }
      posX = Math.max(margin, Math.min(targetScreenCenterX - cardW / 2, vw - cardW - margin));
    }

    setTooltipPos({ x: posX, y: posY });
    setHasPositioned(true);
    onStepChange?.(stepIdx, step.target, { scale: targetScale, x: targetX, y: targetY });
  }, [onStepChange]);

  const goToStep = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= TOUR_STEPS.length) return;
      setCurrentStep(idx);
      const step = TOUR_STEPS[idx];
      onTargetChange?.(step.target);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        calculateGeometry(idx);
      });
    },
    [calculateGeometry, onTargetChange]
  );

  useEffect(() => {
    if (isOpen) {
      goToStep(currentStep);
    } else {
      setHasPositioned(false);
    }
  }, [isOpen, currentStep, goToStep]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      calculateGeometry(currentStep);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isOpen, currentStep, calculateGeometry]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
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
            ? "flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px] pointer-events-auto"
            : "pointer-events-none"
        }`}
      >
        <motion.div
          ref={cardRef}
          key={isCentered ? `step-${currentStep}` : "floating-tour-card"}
          initial={{
            opacity: 0,
            scale: isCentered ? 0.94 : 0.96,
            ...(isCentered ? {} : { x: tooltipPos.x, y: tooltipPos.y }),
          }}
          animate={{
            opacity: isCentered || hasPositioned ? 1 : 0,
            scale: 1,
            ...(isCentered ? {} : { x: tooltipPos.x, y: tooltipPos.y }),
          }}
          exit={{
            opacity: 0,
            scale: 0.94,
          }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
          style={
            isCentered
              ? undefined
              : {
                  position: "fixed",
                  top: 0,
                  left: 0,
                }
          }
          className={`pointer-events-auto w-full bg-neutral-950/95 border border-[#FFBF00]/30 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.85)] p-6 text-neutral-100 flex flex-col gap-3.5 backdrop-blur-md ${
            isCentered ? "max-w-lg" : "w-[420px] max-w-[calc(100vw-32px)]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <span className="font-mono text-xs font-semibold tracking-wider text-[#FFBF00]/90">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button
              type="button"
              onClick={handleComplete}
              className="text-xs text-neutral-400 hover:text-[#FFBF00] transition font-medium cursor-pointer"
            >
              Skip Tour
            </button>
          </div>

          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-2 py-1"
          >
            <h2 className="text-lg font-bold tracking-tight text-white">
              {step.title}
            </h2>
            <p className="text-xs leading-relaxed text-neutral-300">
              {step.description}
            </p>
          </motion.div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 mt-1">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToStep(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentStep
                      ? "w-5 bg-[#FFBF00]"
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
                  className="px-3.5 py-1.5 text-xs border border-neutral-700 hover:bg-neutral-900 text-neutral-300 rounded-md transition cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 text-xs bg-[#FFBF00] text-black font-semibold rounded-md hover:bg-[#ffdb58] shadow-[0_0_12px_rgba(255,191,0,0.25)] transition cursor-pointer"
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
