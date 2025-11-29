import Hero from "@/components/Hero";
import WhyKundkollen from "@/components/WhyKundkollen";
import Features from "@/components/Features";
import About from "@/components/About";
import ContactForm from "@/components/ContactForm";
import BetaTester from "@/components/BetaTester";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-4xl font-bold text-primary mb-4">Välkommen tillbaka!</h1>
          <p className="text-secondary mb-6">Du är redan inloggad.</p>
          <Button onClick={() => navigate("/dashboard")} size="lg">
            Gå till Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Top Bar for Landing */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-accent/20 flex items-center justify-center border border-accent/30">
                <span className="text-accent font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold text-primary">Kundkollen</span>
            </div>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Logga in
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Hero />
        <WhyKundkollen />
        <Features />
        <About />
        <ContactForm />
        <BetaTester />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-secondary">
            © 2025 Kundkollen. Ett svenskt CRM-verktyg för småföretagare.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
