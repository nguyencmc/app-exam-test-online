import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const StepIndicator = ({ steps, currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick}
              className={cn(
                "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 font-semibold",
                currentStep > step.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.id
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted border-muted-foreground/30 text-muted-foreground",
                onStepClick && "cursor-pointer hover:scale-105"
              )}
            >
              {currentStep > step.id ? (
                <Check className="w-5 h-5" />
              ) : (
                step.id
              )}
            </button>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-3">
                <div
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    currentStep > step.id ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex items-start justify-between mt-3">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={cn(
              "flex flex-col items-center text-center flex-1",
              index === 0 && "items-start",
              index === steps.length - 1 && "items-end"
            )}
            style={{ maxWidth: `${100 / steps.length}%` }}
          >
            <span className={cn(
              "text-sm font-medium transition-colors",
              currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.title}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              {step.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
