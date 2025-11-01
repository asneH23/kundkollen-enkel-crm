import { Users, FileText, Bell, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Kundregister",
    description: "Samla all kundinfo på ett ställe. Enkel överblick över kontakter, historik och avtal.",
  },
  {
    icon: FileText,
    title: "Offert- och säljöversikt",
    description: "Skapa och följ upp offerter. Se vilka affärer som är på gång och vilka som har avslutats.",
  },
  {
    icon: Bell,
    title: "Påminnelser om uppföljning",
    description: "Missa aldrig att följa upp en kund. Automatiska påminnelser håller dig uppdaterad.",
  },
  {
    icon: BarChart3,
    title: "Enkla rapporter",
    description: "Få snabba insikter om försäljning och kundrelationer. Inga komplicerade inställningar.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-background" id="funktioner">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Allt du behöver – och inget mer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kundkollen fokuserar på det viktiga. Ett enkelt CRM utan onödiga funktioner.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-md transition-shadow border-border cursor-pointer group"
                onClick={() => {
                  const betaSection = document.getElementById('beta');
                  betaSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--feature-icon-bg))] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[hsl(var(--feature-icon-fg))]" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
