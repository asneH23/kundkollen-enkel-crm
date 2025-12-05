
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, CreditCard, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import InvoiceCard, { Invoice } from "@/components/InvoiceCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Invoices = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [companyInfo, setCompanyInfo] = useState<any>(null);

    const fetchInvoices = async () => {
        if (!user) return;

        try {
            setLoading(true);
            // Fetch invoices
            const { data: invoicesData, error: invoiceError } = await supabase
                .from('invoices' as any)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (invoiceError) throw invoiceError;

            // Fetch customers
            const { data: customersData, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('user_id', user.id);

            if (customerError) throw customerError;

            setInvoices(invoicesData || []);
            setCustomers(customersData || []);

            // Fetch profile for company info
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setCompanyInfo({
                    name: profile.company_name,
                    email: profile.email,
                    phone: profile.phone,
                    address: profile.address,
                });
            }

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Fel vid hämtning",
                description: "Kunde inte hämta fakturor",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [user]);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('invoices' as any)
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Status uppdaterad",
                description: `Fakturans status har ändrats till ${status}.`,
            });

            fetchInvoices();
        } catch (error) {
            toast({
                title: "Fel",
                description: "Kunde inte uppdatera status",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (invoice: Invoice) => {
        if (!confirm("Är du säker på att du vill ta bort fakturan?")) return;

        try {
            const { error } = await supabase
                .from('invoices' as any)
                .delete()
                .eq('id', invoice.id);

            if (error) throw error;

            toast({
                title: "Faktura borttagen",
                description: "Fakturan har tagits bort",
            });

            fetchInvoices();
        } catch (error) {
            toast({
                title: "Fel",
                description: "Kunde inte ta bort faktura",
                variant: "destructive"
            });
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.invoice_number.toString().includes(searchTerm) ||
            customers.find(c => c.id === invoice.customer_id)?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customers.find(c => c.id === invoice.customer_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getCustomerName = (customerId: string | null) => {
        if (!customerId) return "Ingen kund";
        const customer = customers.find(c => c.id === customerId);
        return customer?.company_name || customer?.name || "Okänd kund"; // Handle fallback
    };

    return (
        <div className="space-y-8 animate-enter pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 mt-4 lg:mt-0">
                <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 tracking-tight">Fakturor</h1>
                    <p className="text-primary/70 text-lg">Hantera dina fakturor och följ upp betalningar.</p>
                </div>
                <Button
                    className="premium-button"
                    onClick={() => {
                        toast({
                            title: "Tips",
                            description: "Skapa en offert först och välj 'Omvandla till faktura' för att skapa en faktura.",
                        });
                        navigate('/offerter');
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Skapa faktura
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input
                        placeholder="Sök på fakturanummer, kund eller beskrivning..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 premium-input h-11"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 h-11 premium-input">
                        <SelectValue placeholder="Filtrera status" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-black/10 text-primary">
                        <SelectItem value="all">Alla statusar</SelectItem>
                        <SelectItem value="draft">Utkast</SelectItem>
                        <SelectItem value="sent">Skickad</SelectItem>
                        <SelectItem value="paid">Betald</SelectItem>
                        <SelectItem value="overdue">Förfallen</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-primary/50">Laddar fakturor...</div>
            ) : filteredInvoices.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center border-dashed border-black/10">
                    <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20 shadow-glow">
                        <CreditCard className="h-10 w-10 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-3">
                        {invoices.length === 0 ? "Inga fakturor ännu" : "Inga fakturor matchar sökningen"}
                    </h3>
                    <p className="text-primary/70 mb-8 max-w-md mx-auto">
                        Skapa offerter och omvandla dem till fakturor för att se dem här.
                    </p>
                    {invoices.length === 0 && (
                        <Button onClick={() => navigate('/offerter')} className="premium-button px-8 py-6 text-lg">
                            <FileText className="h-5 w-5 mr-2" />
                            Gå till Offerter
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInvoices.map((invoice) => (
                        <InvoiceCard
                            key={invoice.id}
                            invoice={{
                                ...invoice,
                                customer_name: getCustomerName(invoice.customer_id)
                            }}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            companyInfo={companyInfo}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Invoices;
