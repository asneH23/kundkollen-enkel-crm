import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import ContactForm from "@/components/ContactForm";
import BetaTester from "@/components/BetaTester";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="font-bold text-xl text-primary">
              Kundkollen
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#funktioner" className="text-foreground hover:text-primary transition-colors">
                Funktioner
              </a>
              <a href="#om-oss" className="text-foreground hover:text-primary transition-colors">
                Om oss
              </a>
              <a href="#kontakt" className="text-foreground hover:text-primary transition-colors">
                Kontakt
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Hero />
        <Features />
        <About />
        <ContactForm />
        <BetaTester />
      </main>

      {/* Footer */}
      <footer className="bg-secondary py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Kundkollen. Ett svenskt CRM-verktyg för småföretagare.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
