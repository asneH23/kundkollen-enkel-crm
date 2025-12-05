import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mb-6 text-primary border-border hover:border-accent hover:text-accent hover:bg-accent/5 flex items-center gap-2 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Tillbaka
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-accent" />
                            </div>
                            <CardTitle className="text-3xl">Användarvillkor</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Senast uppdaterad: 4 december 2025
                        </p>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">1. Godkännande av villkor</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Genom att skapa ett konto och använda Kundkollen godkänner du dessa användarvillkor.
                                Om du inte godkänner villkoren ska du inte använda tjänsten.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">2. Beskrivning av tjänsten</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Kundkollen är ett CRM-verktyg (Customer Relationship Management) som hjälper dig att hantera kunder,
                                offerter, påminnelser och försäljning. Tjänsten tillhandahålls "som den är" och vi förbehåller oss rätten
                                att uppdatera och förbättra funktionaliteten.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">3. Användarkonto</h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                För att använda tjänsten måste du:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Vara minst 18 år gammal</li>
                                <li>Ange korrekt och aktuell information vid registrering</li>
                                <li>Hålla ditt lösenord säkert och konfidentiellt</li>
                                <li>Meddela oss omedelbart om obehörig användning av ditt konto</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-3">
                                Du är ansvarig för all aktivitet som sker under ditt konto.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">4. Acceptabel användning</h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Du får INTE använda tjänsten för att:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Bryta mot lagar eller regler</li>
                                <li>Skicka spam eller oönskad kommunikation</li>
                                <li>Ladda upp skadlig kod eller virus</li>
                                <li>Försöka få obehörig åtkomst till systemet</li>
                                <li>Störa eller överbelasta tjänsten</li>
                                <li>Kopiera, modifiera eller distribuera tjänsten utan tillstånd</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">5. Ditt innehåll och data</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Du behåller alla rättigheter till den data och det innehåll du laddar upp till Kundkollen.
                                Du ger oss licens att lagra och bearbeta din data för att tillhandahålla tjänsten.
                                Du är ansvarig för att säkerställa att du har rätt att lagra och bearbeta den information du lägger in.
                            </p>

                            <h3 className="text-lg font-medium text-primary mt-4 mb-2">5.1 Personuppgiftsbiträdesavtal</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                I förhållande till de personuppgifter du lagrar i tjänsten (t.ex. dina kunders uppgifter) agerar du som <strong>Personuppgiftsansvarig</strong> och Kundkollen som <strong>Personuppgiftsbiträde</strong>.
                                Genom att använda tjänsten godkänner du att Kundkollen behandlar dessa personuppgifter enligt dina instruktioner
                                för att tillhandahålla tjänsten. Vi förbinder oss att vidta lämpliga tekniska och organisatoriska åtgärder
                                för att skydda dessa uppgifter.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">6. Betalning och prenumeration</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Under beta-perioden är tjänsten gratis. När vi introducerar betalda planer kommer vi att meddela dig
                                i förväg om priser och betalningsvillkor. Du kan när som helst välja att avsluta din prenumeration.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">7. Uppsägning</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Du kan när som helst radera ditt konto via profilsidan. Vid radering kommer all din data att permanent tas bort.
                                Vi förbehåller oss rätten att stänga av eller radera konton som bryter mot dessa villkor.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">8. Ansvarsbegränsning</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Kundkollen tillhandahålls "som den är" utan garantier av något slag. Vi ansvarar inte för:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                                <li>Dataförlust (även om vi gör regelbundna säkerhetskopior)</li>
                                <li>Avbrott i tjänsten</li>
                                <li>Indirekta skador eller förlorad vinst</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-3">
                                Vi rekommenderar starkt att du gör egna säkerhetskopior av viktig data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">9. Ändringar i villkoren</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Vi kan uppdatera dessa villkor från tid till annan. Vid väsentliga ändringar kommer vi att meddela dig
                                via e-post eller genom ett meddelande i tjänsten. Fortsatt användning efter ändringar innebär att du
                                godkänner de nya villkoren.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">10. Tillämplig lag</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Dessa villkor regleras av svensk lag. Eventuella tvister ska i första hand lösas genom förhandling,
                                annars i svensk domstol.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">11. Kontakt</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Om du har frågor om dessa villkor, kontakta oss via din profilsida i appen.
                            </p>
                        </section>

                        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Genom att använda Kundkollen bekräftar du att du har läst, förstått och godkänt dessa användarvillkor.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Terms;
