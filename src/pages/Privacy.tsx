import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

const Privacy = () => {
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
                                <Shield className="h-6 w-6 text-accent" />
                            </div>
                            <CardTitle className="text-3xl">Integritetspolicy</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Senast uppdaterad: 4 december 2025
                        </p>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">1. Introduktion</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Välkommen till Kundkollen. Vi värnar om din integritet och är engagerade i att skydda dina personuppgifter.
                                Denna integritetspolicy förklarar hur vi samlar in, använder och skyddar din information när du använder vår tjänst.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">2. Personuppgiftsansvarig</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Personuppgiftsansvarig för behandlingen av dina personuppgifter är Kundkollen.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">3. Vilka uppgifter samlar vi in?</h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Vi samlar in följande typer av personuppgifter:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Kontoinformation:</strong> E-postadress, företagsnamn, namn</li>
                                <li><strong>Kunddata:</strong> Information om dina kunder som du väljer att lagra (namn, kontaktuppgifter, företag)</li>
                                <li><strong>Affärsdata:</strong> Offerter, fakturor, påminnelser och annan affärsrelaterad information</li>
                                <li><strong>Teknisk data:</strong> IP-adress, webbläsartyp, enhetsinformation (för säkerhet och funktionalitet)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">4. Hur använder vi dina uppgifter?</h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Vi använder dina personuppgifter för att:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Tillhandahålla och administrera tjänsten</li>
                                <li>Skicka påminnelser och notifikationer som du har valt att få</li>
                                <li>Förbättra och utveckla tjänsten</li>
                                <li>Säkerställa säkerhet och förhindra missbruk</li>
                                <li>Uppfylla juridiska krav</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">5. Lagring och säkerhet</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Dina uppgifter lagras säkert hos vår leverantör Supabase inom EU. Vi använder branschstandard säkerhetsåtgärder
                                inklusive kryptering, säkra anslutningar (SSL/TLS) och regelbundna säkerhetskopior.
                                Vi lagrar dina uppgifter så länge du har ett aktivt konto hos oss.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">6. Delning av uppgifter</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Vi säljer aldrig dina personuppgifter. Vi delar endast uppgifter med:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                                <li><strong>Tjänsteleverantörer:</strong> Supabase (databashosting), Vercel (webbhosting), Resend (e-posttjänst)</li>
                                <li><strong>Juridiska krav:</strong> Om det krävs enligt lag</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">7. Dina rättigheter enligt GDPR</h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Du har rätt att:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Få tillgång</strong> till dina personuppgifter</li>
                                <li><strong>Rätta</strong> felaktiga uppgifter</li>
                                <li><strong>Radera</strong> dina uppgifter ("rätten att bli glömd")</li>
                                <li><strong>Begränsa</strong> behandlingen av dina uppgifter</li>
                                <li><strong>Dataportabilitet</strong> - få ut dina uppgifter i ett strukturerat format</li>
                                <li><strong>Invända</strong> mot behandling av dina uppgifter</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-3">
                                För att utöva dina rättigheter, kontakta oss via din profilsida eller radera ditt konto direkt i appen.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">8. Cookies</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Vi använder nödvändiga cookies för att hålla dig inloggad och säkerställa att tjänsten fungerar korrekt.
                                Vi använder inte cookies för marknadsföring eller spårning.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">9. Ändringar i policyn</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Vi kan uppdatera denna integritetspolicy från tid till annan. Vi kommer att meddela dig om väsentliga ändringar
                                via e-post eller genom ett meddelande i tjänsten.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-primary mb-3">10. Kontakt</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Om du har frågor om denna integritetspolicy eller hur vi hanterar dina personuppgifter,
                                kontakta oss via din profilsida i appen.
                            </p>
                        </section>

                        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Denna policy följer kraven i EU:s dataskyddsförordning (GDPR) och svensk lag.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Privacy;
