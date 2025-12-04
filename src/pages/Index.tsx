import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, BarChart3, Users, FileText, Shield, Zap, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Snygga Offerter",
      description: "Skapa professionella offerter på sekunder. Enkelt att lägga till priser, beskrivningar och leveransdatum."
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
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer no-underline outline-none border-none">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="Kundkollen Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors">Kundkollen</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="premium-button rounded-full px-4 sm:px-6 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Gå till Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-primary/60 hover:text-primary hover:bg-black/5 rounded-full px-3 sm:px-6 text-sm sm:text-base"
                >
                  Logga in
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="premium-button rounded-full px-4 sm:px-6 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Kom igång gratis</span>
                  <span className="sm:hidden">Kom igång</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary tracking-tight leading-[1.1]">
                CRM för dig som vill <span className="text-accent">växa smartare.</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-primary/60 leading-relaxed max-w-lg">
                Sluta krångla med kalkylblad och kalendrar. Kundkollen hjälper dig att organisera kunder, offerter, påminnelser och försäljning i ett verktyg som faktiskt är kul att använda.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="premium-button h-12 sm:h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg w-full sm:w-auto"
                >
                  Skapa konto gratis <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg border-2 border-black/10 hover:bg-white hover:border-black/20 bg-transparent w-full sm:w-auto"
                >
                  Läs mer
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 pt-4 sm:pt-8 text-xs sm:text-sm text-primary/60 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" /> Inget kreditkort
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" /> Kom igång på 1 min
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" /> Svensk support
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
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

      {/* What is CRM Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-[#F5F5F5] rounded-3xl p-8 md:p-12 border border-black/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 flex-shrink-0">
                <HelpCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  Vad är CRM egentligen?
                </h2>
                <p className="text-lg text-primary/70 leading-relaxed mb-6">
                  CRM står för "Customer Relationship Management" – låt oss förklara det enklare:
                  det är ett verktyg som hjälper dig hålla koll på dina kunder och ditt arbete.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary mb-1">Istället för kalkylblad, kalendrar och anteckningar</p>
                      <p className="text-primary/70 text-sm">
                        Alla dina kunder, offerter och påminnelser på ett ställe. Inga försvunna papper, glömda uppföljningar eller separata kalendrar att hålla koll på.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary mb-1">Få fler jobb och glöm inget</p>
                      <p className="text-primary/70 text-sm">
                        Skapa offerter snabbt, följ upp kunder i tid och se vilka jobb som väntar.
                        Allt som hjälper dig växa din verksamhet.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary mb-1">Enkelt och snabbt</p>
                      <p className="text-primary/70 text-sm">
                        Inga komplicerade system. Om du kan använda en mobiltelefon kan du använda Kundkollen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">Allt du behöver. Inget du inte behöver.</h2>
            <p className="text-base sm:text-lg lg:text-xl text-primary/60 max-w-2xl mx-auto">
              Vi har skalat bort allt onödigt. Kvar finns verktygen som faktiskt gör skillnad för din verksamhet.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 sm:p-8 rounded-2xl bg-[#F5F5F5] hover:bg-black hover:text-white transition-all duration-300 border border-transparent hover:border-accent/20">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-white flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-primary group-hover:text-white">{feature.title}</h3>
                <p className="text-sm sm:text-base text-primary/60 group-hover:text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F5F5F5] pt-0 pb-12">
        <div className="container mx-auto px-6 border-t border-black/5 pt-12">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img src="/logo.png" alt="Kundkollen Logo" className="h-full w-full object-cover" />
                </div>
                <span className="text-xl font-bold text-primary">Kundkollen</span>
              </div>
              <p className="text-sm text-primary/60 leading-relaxed">
                Enkelt CRM för hantverkare som vill växa smartare.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-primary mb-4">Produkt</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/auth" className="text-sm text-primary/60 hover:text-accent transition-colors">
                    Kom igång
                  </Link>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm text-primary/60 hover:text-accent transition-colors"
                  >
                    Funktioner
                  </a>
                </li>
                <li>
                  <Link to="/auth" className="text-sm text-primary/60 hover:text-accent transition-colors">
                    Logga in
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-black/5 pt-8">
            <p className="text-sm text-primary/60 text-center">
              © 2025 Kundkollen. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
