'use client';

import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface TourTooltipProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  targetElement?: HTMLElement | null;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function TourTooltip({
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  targetElement,
  position = 'bottom',
}: TourTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetElement && tooltipRef.current) {
      const rect = targetElement.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'bottom':
          top = rect.bottom + 16;
          left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
          break;
        case 'top':
          top = rect.top - tooltip.offsetHeight - 16;
          left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
          left = rect.left - tooltip.offsetWidth - 16;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
          left = rect.right + 16;
          break;
      }

      // Keep tooltip within viewport
      const padding = 16;
      if (left < padding) left = padding;
      if (left + tooltip.offsetWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltip.offsetWidth - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltip.offsetHeight > window.innerHeight - padding) {
        top = window.innerHeight - tooltip.offsetHeight - padding;
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }
  }, [targetElement, position]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={onSkip} />
      
      {/* Highlight */}
      {targetElement && (
        <div
          className="fixed z-[9999] rounded-xl ring-4 ring-purple-500 ring-offset-4 ring-offset-black/60 pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-white rounded-xl shadow-2xl max-w-sm animate-in fade-in zoom-in-95 duration-200"
        style={{ minWidth: '320px' }}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>
            <button
              onClick={onSkip}
              className="ml-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            {/* Step Counter */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i < currentStep
                      ? 'w-6 bg-purple-500'
                      : i === currentStep
                      ? 'w-8 bg-purple-500'
                      : 'w-1.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={onPrev}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
              <button
                onClick={onNext}
                className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg transition-all shadow-sm flex items-center gap-1"
              >
                {currentStep === totalSteps ? 'Done' : 'Next'}
                {currentStep < totalSteps && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
