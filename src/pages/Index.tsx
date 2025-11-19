import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import ContactForm from "@/components/ContactForm";
import BetaTester from "@/components/BetaTester";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

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
