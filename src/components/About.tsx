const About = () => {
  return (
    <section className="py-24 bg-background border-t border-border relative" id="om-oss">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
      
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded bg-accent/10 border border-accent/20 mb-6">
            <span className="text-2xl font-bold text-accent">K</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-primary tracking-tight">
            Om Kundkollen
          </h2>
        </div>
        <div className="space-y-6 text-lg text-secondary leading-relaxed max-w-3xl mx-auto">
          <p>
            Kundkollen är utvecklat i Sverige, för svenska småföretagare som vill 
            ha ett lättanvänt CRM-verktyg utan krångel.
          </p>
          <p>
            Vi vet att du har fullt upp med att driva ditt företag. Därför har vi 
            skapat ett verktyg som är enkelt att komma igång med, men ändå kraftfullt 
            nog att hålla reda på dina viktigaste kundrelationer.
          </p>
          <p>
            Ingen onödig komplexitet. Ingen överflödig funktioner. Bara det du behöver 
            för att hålla koll på dina kunder och affärer.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
