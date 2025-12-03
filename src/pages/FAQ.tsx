import { HelpCircle, Users, FileText, Bell, BarChart3, Shield, Download, Target, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FAQ = () => {
  const navigate = useNavigate();

  const faqCategories = [
    {
      icon: Users,
      title: "Kunder",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      questions: [
        {
          question: "Hur lägger jag till en kund?",
          answer: "Gå till 'Kunder' i menyn och klicka på 'Lägg till kund'. Fyll i företagsnamn, kontaktperson, email och telefonnummer. Du kan också lägga till adress om du vill. All information sparas säkert och är bara synlig för dig."
        },
        {
          question: "Kan jag redigera en kund efter att jag har lagt till den?",
          answer: "Ja, absolut! Klicka på 'Hantera' på kundkortet eller öppna kunden och klicka på redigeringsikonen. Du kan uppdatera all information när som helst."
        },
        {
          question: "Vad händer om jag raderar en kund?",
          answer: "Om du raderar en kund behålls alla offerter och påminnelser som är kopplade till kunden, men de kommer inte längre vara kopplade till kunden. Du får en varning innan radering om det finns kopplade data, så du kan välja att avbryta om du vill."
        },
        {
          question: "Kan jag söka efter kunder?",
          answer: "Ja, det finns en sökfunktion på kunder-sidan. Du kan söka efter företagsnamn eller kontaktperson. Sökningen är direkt och visar resultat medan du skriver."
        }
      ]
    },
    {
      icon: FileText,
      title: "Offerter",
      color: "bg-green-50 text-green-700 border-green-200",
      questions: [
        {
          question: "Hur skapar jag en offert?",
          answer: "Gå till 'Offerter' och klicka på 'Skapa offert'. Välj en kund (eller skapa en ny), lägg till titel, beskrivning och belopp. Du kan sedan spara offerten som utkast eller skicka den direkt via email."
        },
        {
          question: "Hur skickar jag en offert via email?",
          answer: "Öppna offerten och klicka på 'Skicka offert'. Din standard email-klient öppnas med offerten förfylld. Du kan redigera meddelandet innan du skickar."
        },
        {
          question: "Vad betyder de olika statusarna?",
          answer: "Utkast = offerten är inte skickad ännu. Skickad = offerten har skickats till kunden. Accepterad = kunden har accepterat offerten. Avvisad = kunden har avvisat offerten."
        },
        {
          question: "Kan jag redigera en offert efter att jag har skickat den?",
          answer: "Ja, du kan alltid redigera offerter. Om du har skickat en offert och behöver göra ändringar, kan du uppdatera den och skicka en ny version."
        }
      ]
    },
    {
      icon: Bell,
      title: "Påminnelser",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      questions: [
        {
          question: "Hur fungerar påminnelser?",
          answer: "Påminnelser hjälper dig komma ihåg att följa upp kunder. Skapa en påminnelse med ett datum och tidpunkt. Du får automatiskt email-påminnelser innan datumet så att du inte missar något."
        },
        {
          question: "När får jag email-påminnelser?",
          answer: "Du får email-påminnelser dagligen klockan 08:00 (svensk tid) om du har påminnelser som ska triggas den dagen. Påminnelserna skickas automatiskt via vårt system."
        },
        {
          question: "Kan jag skapa påminnelser för flera kunder samtidigt?",
          answer: "För närvarande skapar du en påminnelse i taget. Detta säkerställer att varje påminnelse är anpassad för just den kunden och situationen."
        },
        {
          question: "Vad händer när en påminnelse är klar?",
          answer: "När du markerar en påminnelse som klar försvinner den från listan över aktiva påminnelser. Du kan fortfarande se den i historiken om du behöver."
        }
      ]
    },
    {
      icon: BarChart3,
      title: "Rapporter & Statistik",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      questions: [
        {
          question: "Hur ändrar jag mitt säljmål?",
          answer: "Gå till 'Översikt' (Dashboard) och klicka på säljmål-kortet. Där kan du sätta eller ändra ditt månadsvisa säljmål. Detta hjälper dig följa hur din försäljning går."
        },
        {
          question: "Vad visar rapporterna?",
          answer: "Rapporterna visar översikt över dina kunder, offerter och påminnelser. Du kan se totalt antal kunder, värde på offerter, vunna offerter och mycket mer."
        },
        {
          question: "Kan jag exportera mina rapporter?",
          answer: "Exportfunktioner kommer snart! Just nu kan du se alla dina rapporter direkt i Kundkollen. All din data sparas säkert och är alltid tillgänglig."
        }
      ]
    },
    {
      icon: Shield,
      title: "Säkerhet & Data",
      color: "bg-red-50 text-red-700 border-red-200",
      questions: [
        {
          question: "Är min data säker?",
          answer: "Ja, all data sparas säkert enligt GDPR. Vi använder krypterad lagring och följer alla dataskyddsregler. Din information delas aldrig med tredje part och är bara synlig för dig."
        },
        {
          question: "Var sparas min data?",
          answer: "All data sparas säkert i våra servrar i Europa. Vi följer alla GDPR-regler och säkerställer att din information är skyddad."
        },
        {
          question: "Kan jag ta bort mitt konto?",
          answer: "Ja, kontakta oss via support om du vill ta bort ditt konto. Vi hjälper dig att exportera din data innan radering om du vill behålla en kopia."
        },
        {
          question: "Vem har tillgång till min data?",
          answer: "Bara du har tillgång till din data. Vi ser aldrig dina kunduppgifter, offerter eller påminnelser. Allt är krypterat och säkert."
        }
      ]
    },
    {
      icon: HelpCircle,
      title: "Allmänt",
      color: "bg-gray-50 text-gray-700 border-gray-200",
      questions: [
        {
          question: "Hur mycket kostar Kundkollen?",
          answer: "Kundkollen är gratis att använda under testversionen! Vi vill hjälpa hantverkare att växa smartare."
        },
        {
          question: "Vilka enheter kan jag använda Kundkollen på?",
          answer: "Kundkollen fungerar på alla enheter - dator, surfplatta och mobil. Allt är webbaserat så du behöver bara en webbläsare."
        },
        {
          question: "Behöver jag ladda ner något?",
          answer: "Nej, Kundkollen är helt webbaserat. Du behöver bara skapa ett konto och logga in. Inga nedladdningar eller installationer krävs."
        },
        {
          question: "Hur kontaktar jag support?",
          answer: "Du kan klicka på 'Hjälp & Support' i menyn för att se vanliga frågor och svar. För mer specifik hjälp, kontakta oss via support."
        }
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
          <HelpCircle className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4">Vanliga frågor</h1>
        <p className="text-lg text-primary/70 max-w-2xl mx-auto">
          Här hittar du svar på de vanligaste frågorna om Kundkollen. Behöver du mer hjälp? Klicka på "Hjälp & Support" i menyn.
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <div key={categoryIndex} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl ${category.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-primary">{category.title}</h2>
              </div>

              <div className="grid gap-4">
                {category.questions.map((faq, faqIndex) => (
                  <Card
                    key={faqIndex}
                    className="p-6 border border-black/10 hover:border-accent/30 hover:shadow-md transition-all duration-300"
                  >
                    <h3 className="font-bold text-primary mb-2 text-lg">{faq.question}</h3>
                    <p className="text-primary/70 leading-relaxed">{faq.answer}</p>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 p-8 rounded-3xl bg-accent/5 border border-accent/20">
        <h3 className="text-xl font-bold text-primary mb-4">Behöver du mer hjälp?</h3>
        <p className="text-primary/70 mb-6">
          Klicka på "Hjälp & Support" i menyn för snabbguide och mer information. Du kan också komma igång direkt genom att följa vår onboarding-guide.
        </p>
        <Button
          onClick={() => navigate("/dashboard")}
          className="premium-button rounded-xl"
        >
          Gå till Översikt <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FAQ;

