import { Card, CardContent } from "@/components/ui/card";
import { Clock, Shield, Zap, Target, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Sparar tid",
    description: "Ingen komplicerad setup. Kom igång på minuter, inte timmar. Fokusera på ditt arbete istället för att lära dig ett nytt system.",
  },
  {
    icon: Shield,
    title: "Säkert och pålitligt",
    description: "Dina kunduppgifter är säkert sparade. GDPR-kompatibel och byggd för svenska företag med svenska dataskyddsregler i åtanke.",
  },
  {
    icon: Zap,
    title: "Snabb och responsiv",
    description: "Fungerar lika bra på mobilen som på datorn. Uppdatera kunder och offerter direkt från bygget eller kontoret.",
  },
  {
    icon: Target,
    title: "Byggt för hantverkare",
    description: "Designat specifikt för dig som jobbar med händerna. Inga onödiga funktioner – bara det du faktiskt behöver för att driva ditt företag.",
  },
];

const WhyKundkollen = () => {
  return (
    <section className="py-24 bg-background border-t border-border relative overflow-hidden" id="las-mer">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded bg-accent/10 border border-accent/20 mb-6">
            <Target className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-primary tracking-tight">
            Varför välja Kundkollen?
          </h2>
          <p className="text-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Ett CRM-verktyg som faktiskt passar ditt arbete. Ingen överflödig komplexitet, 
            bara enkla verktyg som hjälper dig hålla koll på det som betyder mest – dina kunder och affärer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="p-6 border-border bg-card hover:border-accent/30 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded bg-accent/10 flex items-center justify-center border border-accent/20 flex-shrink-0">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-primary">{benefit.title}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="border-accent/20 bg-card/50 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <CardContent className="p-8 md:p-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-accent/10 border border-accent/20 mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
                Enkelt att komma igång
              </h3>
              <p className="text-lg text-secondary mb-6 leading-relaxed">
                Inga komplicerade installationer eller långa utbildningar. Registrera dig, 
                lägg till dina första kunder och börja använda Kundkollen direkt. 
                Om du kan använda en mobiltelefon kan du använda Kundkollen.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  <span>Kom igång på 5 minuter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  <span>Fungerar på alla enheter</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default WhyKundkollen;

