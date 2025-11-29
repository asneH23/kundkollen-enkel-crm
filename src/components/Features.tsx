import { Users, FileText, Bell, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Users,
    title: "Kundregister",
    description: "Samla all kundinfo på ett ställe. Enkel överblick över kontakter, historik och avtal.",
    route: "/kunder",
  },
  {
    icon: FileText,
    title: "Offert- och säljöversikt",
    description: "Skapa och följ upp offerter. Se vilka affärer som är på gång och vilka som har avslutats.",
    route: "/offerter",
  },
  {
    icon: Bell,
    title: "Påminnelser om uppföljning",
    description: "Missa aldrig att följa upp en kund. Automatiska påminnelser håller dig uppdaterad.",
    route: "/paminnelser",
  },
  {
    icon: BarChart3,
    title: "Enkla rapporter",
    description: "Få snabba insikter om försäljning och kundrelationer. Inga komplicerade inställningar.",
    route: "/rapporter",
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background border-t border-border relative overflow-hidden" id="funktioner">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(74, 222, 128, 0.1) 35px, rgba(74, 222, 128, 0.1) 70px)`
        }}></div>
      </div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded bg-accent/10 border border-accent/20 mb-6">
            <FileText className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-primary tracking-tight">
            Allt du behöver – och inget mer
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Kundkollen fokuserar på det viktiga. Ett enkelt CRM utan onödiga funktioner.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-border cursor-pointer group bg-card"
                onClick={() => navigate(feature.route)}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 rounded bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300 border border-accent/20 group-hover:scale-110">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary group-hover:text-accent transition-colors">{feature.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
