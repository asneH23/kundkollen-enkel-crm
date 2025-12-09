import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateRotRutXml } from "@/utils/rotRutXmlGenerator";
import { generateSieContent, downloadSieFile } from "@/utils/sieGenerator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Accounting = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [companyOrgNumber, setCompanyOrgNumber] = useState("");

    useEffect(() => {
        if (user) {
            fetchCompanyProfile();
        }
    }, [user]);

    const fetchCompanyProfile = async () => {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('org_number').eq('id', user.id).single();
        if (data?.org_number) {
            setCompanyOrgNumber(data.org_number);
        }
    };

    const handleDownloadXml = async (type: 'ROT' | 'RUT') => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch relevant invoices
            const { data: invoices, error } = await supabase
                .from('invoices')
                .select('*, customer:customers(*)')
                .eq('user_id', user.id)
                .eq('status', 'paid')
                .eq('rot_rut_type', type) // Assuming DB stores 'ROT' or 'RUT'
                .not('rot_rut_amount', 'is', null);

            if (error) throw error;
            if (!invoices || invoices.length === 0) {
                toast({
                    title: "Inga fakturor",
                    description: `Hittade inga betalda ${type}-fakturor att exportera.`,
                    variant: "destructive"
                });
                return;
            }

            const xmlContent = generateRotRutXml(invoices, type, companyOrgNumber);

            // Create download link
            const blob = new Blob([xmlContent], { type: 'application/xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `skatteverket_${type.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast({
                title: "XML Export klar",
                description: `Filen för ${type} har laddats ner.`,
            });
        } catch (error: any) {
            console.error("Export error:", error);
            toast({
                title: "Fel vid export",
                description: error.message || "Kunde inte skapa XML-filen",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSie = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Fetch Company Info (Full)
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            // 2. Fetch ALL Invoices (Paid and Sent?)
            const { data: invoices, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', user.id)
                .in('status', ['sent', 'paid']) // Only post sent/paid invoices
                .order('created_at', { ascending: true }); // Using created_at as proxy for invoice number order if invoice_number is text

            if (error) throw error;

            if (!invoices || invoices.length === 0) {
                toast({
                    title: "Inga fakturor",
                    description: "Hittade inga bokförda fakturor att exportera.",
                    variant: "destructive"
                });
                return;
            }

            // 3. Generate content
            const startYear = new Date().getFullYear();
            const startDate = new Date(startYear, 0, 1);
            const endDate = new Date(startYear, 11, 31);

            const companyInfo = {
                name: profile?.company_name || "Mitt Företag",
                orgNumber: profile?.org_number,
                contactPerson: profile?.contact_person
            };

            const sieContent = generateSieContent(invoices as any[], companyInfo, startDate, endDate);

            // 4. Download
            downloadSieFile(sieContent, `bokforing_${startYear}.se`);

            toast({
                title: "SIE FIl skapad",
                description: "Filen har laddats ner till din dator.",
            });

        } catch (error: any) {
            console.error("SIE Error:", error);
            toast({
                title: "Fel vid export",
                description: error.message || "Kunde inte skapa SIE-fil",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-enter pb-20 p-4 max-w-6xl mx-auto">
            <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Bokföring & Rapporter</h1>
                <p className="text-primary/70 text-lg">Exportera underlag till din revisor och Skatteverket.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skatteverket Card */}
                <Card className="border-2 border-accent/10 shadow-lg bg-card/50">
                    <CardHeader className="bg-accent/5 pb-4 border-b border-accent/10">
                        <CardTitle className="flex items-center gap-2 text-xl text-primary">
                            <FileText className="h-6 w-6 text-accent" />
                            Skatteverket (ROT/RUT)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground mb-6">
                            Ladda ner en XML-fil som du kan ladda upp på Skatteverkets e-tjänst för att begära utbetalning för flera fakturor samtidigt.
                            Endast betalda fakturor inkluderas.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                onClick={() => handleDownloadXml('ROT')}
                                disabled={loading}
                                className="bg-accent hover:bg-accent/90 h-12 text-lg"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Exportera ROT
                            </Button>
                            <Button
                                onClick={() => handleDownloadXml('RUT')}
                                disabled={loading}
                                variant="outline"
                                className="h-12 text-lg border-accent/20 hover:bg-accent/10 text-accent hover:text-accent"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Exportera RUT
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                            Kom ihåg att dina kunder måste ha fullständiga personnummer inlagda.
                        </p>
                    </CardContent>
                </Card>

                {/* SIE Export Card */}
                <Card className="border-2 border-primary/10 shadow-lg bg-card/50">
                    <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2 text-xl text-primary">
                            <FileText className="h-6 w-6 text-primary" />
                            Bokföring (SIE)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground mb-6">
                            Skapa en SIE-fil (SIE4) som din revisor kan importera direkt i sitt bokföringsprogram (Visma, Fortnox, etc).
                            Innehåller alla bokförda fakturor (Skickade & Betalda).
                        </p>
                        <div className="space-y-4">
                            <Button
                                onClick={handleDownloadSie}
                                disabled={loading}
                                className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                            >
                                <FileDown className="mr-2 h-5 w-5" />
                                Exportera SIE-fil ({new Date().getFullYear()})
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                Filen följer SIE4-standarden.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Accounting;
