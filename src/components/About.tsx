const About = () => {
  return (
    <section className="py-20 bg-secondary" id="om-oss">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Om Kundkollen
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground">
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
      </div>
    </section>
  );
};

export default About;
