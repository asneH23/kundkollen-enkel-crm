import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative bg-hero-gradient py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Kundkollen
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Det enkla CRM-verktyget för småföretagare
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Håll koll på dina kunder, offerter och uppföljningar – utan krångel. 
              Ett svenskt CRM-verktyg som är enkelt nog att börja använda idag.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button variant="hero" size="lg">
                Testa gratis
              </Button>
              <Button variant="outline" size="lg">
                Läs mer
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={heroImage}
                alt="Kundkollen CRM dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
