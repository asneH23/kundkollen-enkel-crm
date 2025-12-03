import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Users, FileText, Bell, BarChart3, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route?: string;
  action?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Välkommen till Kundkollen!",
    description: "Kundkollen är ditt enkla CRM-system för hantverkare. Här får du en snabb guide för att komma igång.",
    icon: CheckCircle2
  },
  {
    id: "customers",
    title: "Lägg till dina kunder",
    description: "Börja med att lägga till dina kunder. Klicka på 'Kunder' i menyn och sedan 'Lägg till kund'. Här sparar du all kontaktinformation på ett ställe.",
    icon: Users,
    route: "/kunder",
    action: "Gå till Kunder"
  },
  {
    id: "quotes",
    title: "Skapa professionella offerter",
    description: "Skapa och hantera alla dina offerter. Koppla dem till dina kunder och följ upp statusen. Du kan även skicka offerter direkt via email.",
    icon: FileText,
    route: "/offerter",
    action: "Gå till Offerter"
  },
  {
    id: "reminders",
    title: "Sätt upp påminnelser",
    description: "Missa aldrig att följa upp en kund. Skapa påminnelser för viktiga datum och få automatiska email-påminnelser innan det är dags.",
    icon: Bell,
    route: "/paminnelser",
    action: "Gå till Påminnelser"
  },
  {
    id: "reports",
    title: "Följ din försäljning",
    description: "Se snabbt hur din verksamhet går med enkla rapporter. Följ ditt säljmål och se vilka offerter som vunnits.",
    icon: BarChart3,
    route: "/rapporter",
    action: "Gå till Rapporter"
  },
  {
    id: "complete",
    title: "Du är redo!",
    description: "Nu har du allt du behöver för att komma igång. Om du behöver hjälp senare, klicka på 'Hjälp & Support' i menyn.",
    icon: CheckCircle2
  }
];

const STORAGE_KEY = "kundkollen_onboarding_completed";

export const hasCompletedOnboarding = (): boolean => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

export const markOnboardingComplete = (): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, "true");
};

export const resetOnboarding = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

// Create a custom event to trigger onboarding
export const triggerOnboarding = (): void => {
  if (typeof window === "undefined") return;
  resetOnboarding();
  window.dispatchEvent(new CustomEvent("openOnboarding"));
};

const OnboardingGuide = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    if (!hasCompletedOnboarding()) {
      setOpen(true);
    }

    // Listen for custom event to open onboarding
    const handleOpenOnboarding = () => {
      setOpen(true);
      setCurrentStep(0);
    };

    window.addEventListener("openOnboarding", handleOpenOnboarding);
    return () => {
      window.removeEventListener("openOnboarding", handleOpenOnboarding);
    };
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    markOnboardingComplete();
    setOpen(false);
  };

  const handleComplete = () => {
    markOnboardingComplete();
    setOpen(false);
  };

  if (!open) return null;

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="bg-white border border-black/10 text-primary sm:max-w-[600px] rounded-3xl p-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress Bar */}
        <div className="h-1.5 bg-black/5 w-full">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 relative">
          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 flex-shrink-0">
              <Icon className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-1">{step.title}</h2>
              <p className="text-sm text-primary/60">
                Steg {currentStep + 1} av {onboardingSteps.length}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-primary/70 text-lg leading-relaxed mb-8 min-h-[80px]">
            {step.description}
          </p>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={cn(
                "px-4 py-2 rounded-xl",
                isFirstStep && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Föregående
            </Button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="px-4 py-2 rounded-xl text-primary/60 hover:text-primary hover:bg-black/5"
                >
                  Hoppa över
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="px-6 py-2 premium-button rounded-xl"
              >
                {isLastStep ? "Kom igång!" : "Nästa"}
                {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingGuide;

