import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, BarChart3, Users, FileText, Shield, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Snygga Offerter",
      description: "Skapa professionella offerter på sekunder. Imponera på dina kunder med modern design."
    },
    {
      icon: Users,
      title: "Kundregister",
      description: "Samla alla dina kunder på ett ställe. Håll koll på kontaktuppgifter och historik."
    },
    {
      icon: BarChart3,
      title: "Försäljningskoll",
      description: "Följ din försäljning i realtid. Sätt mål och se hur du ligger till."
    },
    {
      icon: Zap,
      title: "Snabbt & Enkelt",
      description: "Inga krångliga funktioner. Allt är byggt för att du ska spara tid."
    }
  ];

  return (
    <div className="min-h-screen bg-[#E8E8E8] font-sans selection:bg-accent/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#E8E8E8]/80 backdrop-blur-md border-b border-black/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">Kundkollen</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="premium-button rounded-full px-6"
              >
                Gå till Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-primary/60 hover:text-primary hover:bg-black/5 rounded-full px-6"
                >
                  Logga in
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="premium-button rounded-full px-6"
                >
                  Kom igång gratis
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm font-medium text-primary/80">Nu tillgänglig för alla småföretagare</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold text-primary tracking-tight leading-[1.1]">
                CRM för dig som vill <span className="text-accent">växa smartare.</span>
              </h1>

              <p className="text-xl text-primary/60 leading-relaxed max-w-lg">
                Sluta krångla med Excel. Kundkollen hjälper dig att organisera kunder, offerter och försäljning i ett verktyg som faktiskt är kul att använda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="premium-button h-14 px-8 rounded-full text-lg"
                >
                  Skapa konto gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-14 px-8 rounded-full text-lg border-2 border-black/10 hover:bg-white hover:border-black/20 bg-transparent"
                >
                  Läs mer
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-8 text-sm text-primary/60 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" /> Inget kreditkort
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" /> Kom igång på 1 min
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" /> Svensk support
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-[3rem] blur-3xl opacity-50" />
              <div className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl border border-black/5 rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="grid grid-cols-2 gap-6">
                  {/* Mock Stat Cards */}
                  <div className="bg-[#F5F5F5] p-6 rounded-3xl">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold text-primary">275 000 kr</div>
                    <div className="text-sm text-primary/60">Försäljning i år</div>
                  </div>
                  <div className="bg-[#F5F5F5] p-6 rounded-3xl">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold text-primary">48</div>
                    <div className="text-sm text-primary/60">Aktiva kunder</div>
                  </div>
                  {/* Mock Quote List */}
                  <div className="col-span-2 bg-[#F5F5F5] p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-primary">Senaste offerter</span>
                      <span className="text-xs text-primary/60">Visa alla</span>
                    </div>
                    {[
                      { title: "Renovering av badrum", customer: "Familjen Andersson", amount: "85 000" },
                      { title: "Köksinstallation", customer: "Villa Ekbacken", amount: "125 000" },
                      { title: "Takrenovering", customer: "Fastighets AB", amount: "65 000" }
                    ].map((quote, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-black/5 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary/60" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{quote.title}</div>
                            <div className="text-xs text-primary/60">{quote.customer}</div>
                          </div>
                        </div>
                        <span className="text-sm font-bold">{quote.amount} kr</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white rounded-t-[3rem] border-t border-black/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">Allt du behöver. Inget du inte behöver.</h2>
            <p className="text-xl text-primary/60 max-w-2xl mx-auto">
              Vi har skalat bort allt onödigt. Kvar finns verktygen som faktiskt gör skillnad för din verksamhet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-3xl bg-[#F5F5F5] hover:bg-black hover:text-white transition-all duration-300">
                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary group-hover:text-white">{feature.title}</h3>
                <p className="text-primary/60 group-hover:text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-0 pb-12">
        <div className="container mx-auto px-6 text-center border-t border-black/5 pt-12">
          <p className="text-primary/60 font-medium">
            © 2025 Kundkollen. Byggt med ❤️ i Sverige.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
