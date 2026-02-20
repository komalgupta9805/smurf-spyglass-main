import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "upload-section",
    title: "Upload Your Data",
    description: "Start by uploading a CSV file with transaction data. The file should contain transaction_id, sender_id, receiver_id, amount, and timestamp columns.",
    position: "bottom",
  },
  {
    target: "validate-button",
    title: "Validate & Analyze",
    description: "Validate your data format and run the detection engine to analyze suspicious patterns in your transaction network.",
    position: "bottom",
  },
  {
    target: "analytics-tab",
    title: "Review Analytics",
    description: "Explore comprehensive analytics including risk scores, suspicious networks, and behavioral patterns detected in your data.",
    position: "bottom",
  },
  {
    target: "graph-tab",
    title: "Visualize Networks",
    description: "View the transaction network as an interactive graph. Identify connections and relationships between entities.",
    position: "bottom",
  },
  {
    target: "report-tab",
    title: "Export Findings",
    description: "Generate compliance reports, export data in multiple formats (JSON, CSV), and document your findings for review.",
    position: "bottom",
  },
];

interface OnboardingTourProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

const OnboardingTour = ({ onComplete, autoStart = false }: OnboardingTourProps) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const element = document.querySelector(`[data-tour-id="${tourSteps[currentStep].target}"]`) as HTMLElement;
    setTargetElement(element);
  }, [currentStep, isActive]);

  const goToNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem("onboarding-completed", "true");
    onComplete?.();
  };

  if (!isActive) {
    return null;
  }

  const step = tourSteps[currentStep];
  const rect = targetElement?.getBoundingClientRect();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 pointer-events-none" />

      {/* Highlight */}
      {rect && (
        <div
          className="fixed border-2 border-primary pointer-events-none z-50 rounded-lg animate-pulse"
          style={{
            top: `${rect.top - 8}px`,
            left: `${rect.left - 8}px`,
            width: `${rect.width + 16}px`,
            height: `${rect.height + 16}px`,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className={cn(
          "fixed z-50 w-80 shadow-2xl p-4 bg-card border-primary/30",
          step.position === "top" && "bottom-full mb-4",
          step.position === "bottom" && "top-full mt-4",
          step.position === "left" && "right-full mr-4",
          step.position === "right" && "left-full ml-4"
        )}
        style={{
          left: rect ? `${rect.left + rect.width / 2 - 160}px` : "50%",
          top: rect && step.position !== "top" && step.position !== "bottom" ? `${rect.top + rect.height / 2 - 80}px` : "auto",
        }}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-primary">{step.title}</h3>
            <button
              onClick={completeTour}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{step.description}</p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {tourSteps.length}
            </span>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft size={14} />
                Back
              </Button>
              <Button
                size="sm"
                onClick={goToNextStep}
                className="gap-1"
              >
                {currentStep === tourSteps.length - 1 ? "Done" : "Next"}
                {currentStep < tourSteps.length - 1 && <ChevronRight size={14} />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default OnboardingTour;
