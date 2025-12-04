import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Users, FileText, Bell, BarChart3, CheckCircle2, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
    id: "name",
    title: "Vad ska vi kalla dig?",
    description: "Vi vill känna dig bättre. Vad vill du att vi ska kalla dig?",
    icon: User
  },
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
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user has completed onboarding
    // On mobile, don't show onboarding automatically if already completed
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

  // Load existing display name if user has one
  useEffect(() => {
    if (user && open) {
      const loadDisplayName = async () => {
        try {
          // Always prioritize database first (source of truth across devices)
          const { data, error } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", user.id)
            .single();

          if (!error && data && (data as any).display_name) {
            setDisplayName((data as any).display_name);
            localStorage.setItem(`profile_display_name_${user.id}`, (data as any).display_name);
            return;
          }

          // Fallback to localStorage if database has no value
          const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
          if (storedName) {
            setDisplayName(storedName);
          }
        } catch (error) {
          // Ignore errors, user can still enter name
          console.log("Could not load display name:", error);
          // Try localStorage as last resort
          const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
          if (storedName) {
            setDisplayName(storedName);
          }
        }
      };

      loadDisplayName();
    }
  }, [user, open]);

  const handleNext = async () => {
    const currentStepData = onboardingSteps[currentStep];
    
    // If we're on the name step, save the name first
    if (currentStepData.id === "name") {
      if (!displayName.trim()) {
        toast({
          title: "Namn krävs",
          description: "Vänligen ange ditt namn för att fortsätta.",
          variant: "destructive",
        });
        return;
      }
      
      await saveDisplayName(displayName.trim());
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const saveDisplayName = async (name: string) => {
    if (!user || !name) return;
    
    setSavingName(true);
    
    try {
      // Try to save to database first (source of truth)
      const updateData: any = {
        display_name: name,
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);
      
      if (error) {
        // If column doesn't exist, try to add it via insert
        if (error.message.includes("column") || error.message.includes("does not exist")) {
          // Column might not exist, try insert/upsert instead
          try {
            await supabase
              .from("profiles")
              .upsert({ id: user.id, display_name: name }, { onConflict: "id" });
          } catch (upsertError) {
            console.error("Error upserting display name:", upsertError);
          }
        } else {
          console.error("Error saving display name:", error);
        }
      }
      
      // Save to localStorage as fallback/cache
      localStorage.setItem(`profile_display_name_${user.id}`, name);
      
      // Trigger custom event to notify other components
      window.dispatchEvent(new CustomEvent('displayNameUpdated'));
    } catch (error) {
      console.error("Error saving display name:", error);
      // Still save to localStorage as fallback
      localStorage.setItem(`profile_display_name_${user.id}`, name);
      window.dispatchEvent(new CustomEvent('displayNameUpdated'));
    } finally {
      setSavingName(false);
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Allow closing on mobile if user wants to skip
      if (!isOpen && isMobile) {
        handleSkip();
      }
    }}>
      <DialogContent 
        className={cn(
          "bg-white border border-black/10 text-primary rounded-3xl p-0 overflow-hidden",
          isMobile ? "sm:max-w-[90vw] max-h-[90vh] p-4" : "sm:max-w-[600px]",
          "[&>button]:hidden"
        )}
        onInteractOutside={(e) => {
          // Allow closing on mobile by clicking outside
          if (isMobile) {
            e.preventDefault();
            handleSkip();
          } else {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Allow closing with ESC on mobile
          if (isMobile) {
            handleSkip();
          } else {
            e.preventDefault();
          }
        }}
      >
        {/* Progress Bar */}
        <div className="h-1.5 bg-black/5 w-full">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={cn("relative", isMobile ? "p-4" : "p-8")}>
          {/* Close button on mobile */}
          {isMobile && (
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 p-2 rounded-lg hover:bg-black/5 transition-colors z-10"
              aria-label="Stäng"
            >
              <X className="h-5 w-5 text-primary/60" />
            </button>
          )}

          {/* Icon and Title */}
          <div className={cn("flex items-center gap-4 mb-6", isMobile && "gap-3 mb-4")}>
            <div className={cn(
              "rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 flex-shrink-0",
              isMobile ? "h-12 w-12" : "h-16 w-16"
            )}>
              <Icon className={cn(isMobile ? "h-6 w-6" : "h-8 w-8")} />
            </div>
            <div className="flex-1">
              <h2 className={cn(
                "font-bold text-primary mb-1",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {step.id === "welcome" && displayName 
                  ? `Välkommen till Kundkollen, ${displayName}!`
                  : step.title}
              </h2>
              <p className={cn("text-primary/60", isMobile ? "text-xs" : "text-sm")}>
                Steg {currentStep + 1} av {onboardingSteps.length}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className={cn(
            "text-primary/70 leading-relaxed",
            isMobile ? "text-base mb-6 min-h-[60px]" : "text-lg mb-8 min-h-[80px]"
          )}>
            {step.description}
          </p>

          {/* Name Input for first step */}
          {step.id === "name" && (
            <div className={cn(isMobile ? "mb-6" : "mb-8")}>
              <Label htmlFor="displayName" className={cn(
                "font-medium text-primary mb-2 block",
                isMobile ? "text-sm" : "text-base"
              )}>
                Ditt namn
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="T.ex. Erik"
                className={cn(
                  "premium-input",
                  isMobile ? "text-base h-11" : "text-lg h-12"
                )}
                autoFocus={!isMobile}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && displayName.trim()) {
                    handleNext();
                  }
                }}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={cn(
            "flex items-center justify-between gap-4",
            isMobile && "gap-2"
          )}>
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={cn(
                "rounded-xl",
                isMobile ? "px-3 py-2 text-sm" : "px-4 py-2",
                isFirstStep && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowLeft className={cn("h-4 w-4", isMobile ? "mr-1" : "mr-2")} />
              <span className={cn(isMobile && "hidden sm:inline")}>Föregående</span>
            </Button>

            <div className="flex gap-2">
              {!isFirstStep && step.id !== "name" && !isMobile && (
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
                disabled={savingName}
                className={cn(
                  "premium-button rounded-xl",
                  isMobile ? "px-4 py-2 text-sm" : "px-6 py-2"
                )}
              >
                {savingName ? "Sparar..." : isLastStep ? "Kom igång!" : "Nästa"}
                {!isLastStep && !savingName && (
                  <ArrowRight className={cn("h-4 w-4", isMobile ? "ml-1" : "ml-2")} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingGuide;

