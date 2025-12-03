import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Users, FileText, Bell, BarChart3, ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { triggerOnboarding } from "./OnboardingGuide";

interface HelpModalProps {
  children?: React.ReactNode;
}

const HelpModal = ({ children }: HelpModalProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const quickStartSteps = [
    {
      icon: Users,
      title: "Lägg till din första kund",
      description: "Börja med att lägga till kunder i ditt register. Klicka på 'Lägg till kund' och fyll i informationen.",
      route: "/kunder",
      action: "Gå till Kunder"
    },
    {
      icon: FileText,
      title: "Skapa din första offert",
      description: "Skapa professionella offerter direkt i Kundkollen. Koppla dem till dina kunder för enkel översikt.",
      route: "/offerter",
      action: "Gå till Offerter"
    },
    {
      icon: Bell,
      title: "Sätt upp en påminnelse",
      description: "Missa aldrig att följa upp en kund. Skapa påminnelser som hjälper dig hålla koll på viktiga datum.",
      route: "/paminnelser",
      action: "Gå till Påminnelser"
    },
    {
      icon: BarChart3,
      title: "Följ din försäljning",
      description: "Se snabbt hur din verksamhet går med enkla rapporter och statistik.",
      route: "/rapporter",
      action: "Gå till Rapporter"
    }
  ];

  const faqs = [
    {
      question: "Hur lägger jag till en kund?",
      answer: "Gå till 'Kunder' i menyn och klicka på 'Lägg till kund'. Fyll i företagsnamn, kontaktperson, email och telefonnummer. Du kan också lägga till adress om du vill."
    },
    {
      question: "Hur skapar jag en offert?",
      answer: "Gå till 'Offerter' och klicka på 'Skapa offert'. Välj en kund, lägg till titel, beskrivning och belopp. Du kan sedan skicka offerten via email direkt från Kundkollen."
    },
    {
      question: "Hur fungerar påminnelser?",
      answer: "Påminnelser hjälper dig komma ihåg att följa upp kunder. Skapa en påminnelse med ett datum och tidpunkt. Du får automatiskt email-påminnelser innan datumet så att du inte missar något."
    },
    {
      question: "Kan jag exportera min data?",
      answer: "Ja, du kan exportera dina kunder, offerter och rapporter. Funktionen kommer snart, men all din data sparas säkert i vårt system."
    },
    {
      question: "Vad händer om jag raderar en kund?",
      answer: "Om du raderar en kund behålls alla offerter och påminnelser som är kopplade till kunden, men de kommer inte längre vara kopplade till kunden. Du får en varning innan radering om det finns kopplade data."
    },
    {
      question: "Hur ändrar jag mitt säljmål?",
      answer: "Gå till 'Översikt' (Dashboard) och klicka på säljmål-kortet. Där kan du sätta eller ändra ditt månadsvisa säljmål."
    },
    {
      question: "Är min data säker?",
      answer: "Ja, all data sparas säkert enligt GDPR. Vi använder krypterad lagring och följer alla dataskyddsregler. Din information delas aldrig med tredje part."
    },
    {
      question: "Hur tar jag bort mitt konto?",
      answer: "Kontakta oss via support om du vill ta bort ditt konto. Vi hjälper dig att exportera din data innan radering."
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-accent/10 hover:text-accent text-primary/60"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border border-black/10 text-primary sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <HelpCircle className="h-6 w-6 text-accent" />
            </div>
            <DialogTitle className="text-3xl font-bold">Hjälp & Support</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-4">
          {/* Quick Start Guide */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              Snabbstart
            </h3>
            <div className="grid gap-4">
              {quickStartSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl border border-black/5 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 group cursor-pointer"
                    onClick={() => {
                      navigate(step.route);
                      setOpen(false);
                    }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-primary mb-1 group-hover:text-accent transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-sm text-primary/70">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-accent" />
              Vanliga frågor
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-black/5 bg-white hover:border-accent/20 hover:shadow-sm transition-all duration-300"
                >
                  <h4 className="font-bold text-primary mb-2">{faq.question}</h4>
                  <p className="text-sm text-primary/70 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="pt-4 border-t border-black/10 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-primary/70 text-center">
                Behöver du mer hjälp? Kolla vår omfattande FAQ-sida med alla frågor och svar.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => {
                    navigate("/faq");
                    setOpen(false);
                  }}
                  className="premium-button rounded-xl"
                >
                  Visa alla frågor <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    triggerOnboarding();
                    setOpen(false);
                  }}
                  variant="outline"
                  className="rounded-xl border-accent/30 text-accent hover:bg-accent/10"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Visa snabbguide igen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;

