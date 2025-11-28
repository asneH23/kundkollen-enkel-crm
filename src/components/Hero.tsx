import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    "Enkelt kundregister",
    "Offert- och säljöversikt",
    "Påminnelser om uppföljning",
    "Enkla rapporter",
  ];

  return (
    <section className="relative bg-background py-32 lg:py-48 overflow-hidden border-b border-border">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-primary mb-8 tracking-tight">
            CRM för hantverkare
          </h1>
          
          {/* Subheading */}
          <p className="text-xl lg:text-2xl text-secondary mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Håll koll på kunder, offerter och uppföljningar. Enkelt, snabbt och byggt för dig som jobbar med händerna.
          </p>

          {/* Features List */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-card border border-border/50 hover:border-accent/30 transition-colors"
              >
                <Check className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-sm font-medium text-primary">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button
                size="lg"
                className="text-base font-semibold px-10 h-14"
                onClick={() => navigate("/dashboard")}
              >
                Gå till Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="text-base font-semibold px-10 h-14"
                  onClick={() => {
                    const betaSection = document.getElementById('beta');
                    betaSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Testa gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base font-semibold px-10 h-14 border-2"
                  onClick={() => {
                    const featuresSection = document.getElementById('funktioner');
                    featuresSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Läs mer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
