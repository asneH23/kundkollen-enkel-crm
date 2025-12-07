
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, FileText, CreditCard, Filter, Send, Mail, Loader2, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import InvoiceCard, { Invoice } from "@/components/InvoiceCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/pdf/InvoicePDF";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileInvoiceList from "@/components/MobileInvoiceList";
import {
    ResponsiveDialog,
    ResponsiveDialogContent,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
    ResponsiveDialogDescription,
    ResponsiveDialogFooter
} from "@/components/ui/responsive-dialog";

const Invoices = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [companyInfo, setCompanyInfo] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

    // Email state
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [emailMessage, setEmailMessage] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);

    // Edit state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [editFormData, setEditFormData] = useState({
        description: "",
        amount: "",
        dueDate: "",
        status: "draft",
        customerId: "",
        projectId: "",
        rotRutType: "none", // none, ROT, RUT
        laborCost: "",
        propertyDesignation: ""
    });

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

            setInvoices((invoicesData as any) || []);
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

    // Handle auto-open of send dialog from URL params (e.g. from Quotes automation)
    useEffect(() => {
        const action = searchParams.get('action');
        const invoiceId = searchParams.get('invoiceId');

        if (action === 'send' && invoiceId && invoices.length > 0) {
            const invoice = invoices.find(i => i.id === invoiceId);
            if (invoice) {
                // Short delay to ensure everything is loaded/rendered
                setTimeout(() => {
                    handleOpenSendDialog(invoice);
                    // Clear params so it doesn't reopen
                    setSearchParams({});
                }, 500);
            }
        }
    }, [invoices, searchParams]);

    const handleStatusChange = async (id: string, status: string) => {
        if (status === "sent") {
            const invoice = invoices.find(i => i.id === id);
            if (invoice) {
                handleOpenSendDialog(invoice);
            }
            return;
        }

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



    const handleEditClick = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setEditFormData({
            description: invoice.description || "",
            amount: invoice.amount.toString(),
            dueDate: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : "",
            status: invoice.status,
            customerId: invoice.customer_id || "",
            projectId: "", // TODO: Add project support later
            rotRutType: invoice.rot_rut_type || "none",
            laborCost: invoice.labor_cost?.toString() || "",
            propertyDesignation: invoice.property_designation || ""
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingInvoice) return;

        try {
            const { error } = await supabase
                .from('invoices' as any)
                .update({
                    description: editFormData.description,
                    amount: parseFloat(editFormData.amount.replace(/\s/g, '').replace(',', '.')),
                    due_date: editFormData.dueDate,
                    status: editFormData.status,
                    customer_id: editFormData.customerId,
                    rot_rut_type: editFormData.rotRutType === "none" ? null : editFormData.rotRutType,
                    labor_cost: editFormData.laborCost ? parseFloat(editFormData.laborCost.replace(/\s/g, '').replace(',', '.')) : 0,
                    property_designation: editFormData.propertyDesignation
                })
                .eq('id', editingInvoice.id);

            if (error) throw error;

            toast({
                title: "Faktura uppdaterad",
                description: "Ändringarna har sparats",
            });

            setEditDialogOpen(false);
            setEditingInvoice(null);
            fetchInvoices();
        } catch (error: any) {
            console.error("Error updating invoice:", error);
            toast({
                title: "Fel",
                description: "Kunde inte spara ändringar",
                variant: "destructive"
            });
        }
    };

    const handleDeleteClick = (invoice: Invoice) => {
        setInvoiceToDelete(invoice);
        setDeleteDialogOpen(true);
    };

    const handleOpenSendDialog = (invoice: Invoice) => {
        const customer = customers.find(c => c.id === invoice.customer_id);
        const email = customer?.email || "";

        setSelectedInvoice(invoice);
        setCustomerEmail(email);
        setEmailMessage(`Hej,\n\nHär kommer faktura #${invoice.invoice_number} från ${companyInfo?.name || 'oss'}.\n\nVänliga hälsningar,\n${companyInfo?.name || user?.email}`);
        setSendDialogOpen(true);
    };

    const handleSendEmail = async () => {
        if (!selectedInvoice) return;

        try {
            setSendingEmail(true);

            // 1. Generate PDF
            const customer = customers.find(c => c.id === selectedInvoice.customer_id);
            const blob = await pdf(
                <InvoicePDF
                    invoice={selectedInvoice}
                    customer={{
                        name: customer?.company_name || customer?.name || 'Okänd kund',
                        email: customer?.email,
                        phone: customer?.phone,
                        company: customer?.company_name,
                        address: customer?.address,
                    }}
                    companyInfo={companyInfo}
                />
            ).toBlob();

            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];

                // 2. Send email via Edge Function
                const { error } = await supabase.functions.invoke('send-invoice-email', {
                    body: {
                        to: [customerEmail],
                        subject: `Faktura #${selectedInvoice.invoice_number} från ${companyInfo?.name || 'Kundkollen'}`,
                        html: `<p>${emailMessage.replace(/\n/g, '<br>')}</p>`,
                        pdfBase64: base64data,
                        filename: `faktura-${selectedInvoice.invoice_number}.pdf`,
                        fromName: companyInfo?.name || "Kundkollen",
                        replyTo: companyInfo?.email || user?.email
                    }
                });

                if (error) throw error;

                // 3. Update status to 'sent'
                const { error: updateError } = await supabase
                    .from('invoices' as any)
                    .update({ status: 'sent' })
                    .eq('id', selectedInvoice.id);

                if (updateError) throw updateError;

                toast({
                    title: "Faktura skickad",
                    description: `Fakturan har skickats till ${customerEmail}`,
                });

                setSendDialogOpen(false);
                fetchInvoices();
            };

        } catch (error: any) {
            console.error('Email error:', error);
            toast({
                title: "Fel vid utskick",
                description: "Kunde inte skicka fakturan. Försök igen.",
                variant: "destructive"
            });
        } finally {
            setSendingEmail(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!invoiceToDelete) return;

        try {
            const { error } = await supabase
                .from('invoices' as any)
                .delete()
                .eq('id', invoiceToDelete.id);

            if (error) throw error;

            toast({
                title: "Faktura borttagen",
                description: "Fakturan har tagits bort",
            });

            setDeleteDialogOpen(false);
            setInvoiceToDelete(null);
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
            {/* Filters */}
            <div className="sticky top-14 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 mb-6 md:static md:bg-transparent md:border-0 md:p-0 md:m-0 md:mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 pointer-events-none" />
                        <Input
                            placeholder="Sök på fakturanummer, kund eller beskrivning..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 premium-input h-11 text-base shadow-sm"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48 h-11 premium-input text-base shadow-sm">
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
                <>
                    {/* Mobile List View */}
                    <MobileInvoiceList
                        invoices={filteredInvoices.map(invoice => ({
                            ...invoice,
                            customer_name: getCustomerName(invoice.customer_id)
                        }))}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onStatusChange={handleStatusChange}
                        companyInfo={companyInfo}
                    />

                    {/* Desktop Grid View */}
                    <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInvoices.map((invoice) => (
                            <InvoiceCard
                                key={invoice.id}
                                invoice={{
                                    ...invoice,
                                    customer_name: getCustomerName(invoice.customer_id)
                                }}
                                onDelete={handleDeleteClick}
                                onStatusChange={handleStatusChange}
                                companyInfo={companyInfo}
                                onEdit={handleEditClick}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white border border-black/10 text-primary">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-primary">Ta bort faktura?</AlertDialogTitle>
                        <AlertDialogDescription className="text-primary/70">
                            Är du säker på att du vill ta bort faktura #{invoiceToDelete?.invoice_number}?
                            Denna åtgärd kan inte ångras.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-black/10 text-primary hover:bg-black/5">
                            Avbryt
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Ta bort
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Email Send Dialog */}
            <ResponsiveDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <ResponsiveDialogContent className="sm:max-w-[500px] glass-panel border-black/10 text-primary">
                    <ResponsiveDialogHeader>
                        <div className="mx-auto bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-6 h-6 text-primary" />
                        </div>
                        <ResponsiveDialogTitle className="text-center text-xl">Skicka faktura</ResponsiveDialogTitle>
                        <ResponsiveDialogDescription className="text-center text-primary/60">
                            Skicka fakturan direkt till kunden som PDF.
                        </ResponsiveDialogDescription>
                    </ResponsiveDialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Mottagare</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="pl-9 bg-white/50 border-black/10"
                                    placeholder="kund@foretag.se"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Meddelande</Label>
                            <Textarea
                                id="message"
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                className="min-h-[150px] bg-white/50 border-black/10 resize-none p-4"
                            />
                        </div>

                        <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 flex gap-3 items-start">
                            <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                                <Link className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="text-xs text-blue-800">
                                <p className="font-medium mb-0.5">PDF bifogas automatiskt</p>
                                <p className="opacity-80">Faktura #{selectedInvoice?.invoice_number} bifogas som en PDF-fil i mailet.</p>
                            </div>
                        </div>
                    </div>

                    <ResponsiveDialogFooter className="sm:justify-between gap-2">
                        <div className="hidden sm:block"></div>
                        <Button
                            onClick={handleSendEmail}
                            disabled={sendingEmail || !customerEmail}
                            className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90"
                        >
                            {sendingEmail ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Skickar...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Skicka faktura
                                </>
                            )}
                        </Button>
                    </ResponsiveDialogFooter>
                </ResponsiveDialogContent>
            </ResponsiveDialog>

            {/* Edit Invoice Dialog */}
            <ResponsiveDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <ResponsiveDialogContent className="sm:max-w-[600px] bg-white border border-black/10 text-primary rounded-3xl">
                    <ResponsiveDialogHeader>
                        <ResponsiveDialogTitle className="text-2xl font-bold">Redigera faktura #{editingInvoice?.invoice_number}</ResponsiveDialogTitle>
                    </ResponsiveDialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-customer">Kund</Label>
                                <Select
                                    value={editFormData.customerId}
                                    onValueChange={(val) => setEditFormData({ ...editFormData, customerId: val })}
                                >
                                    <SelectTrigger className="premium-input">
                                        <SelectValue placeholder="Välj kund" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-black/10">
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.company_name || c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Beskrivning</Label>
                                <Input
                                    id="edit-description"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="premium-input"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-amount">Belopp (kr)</Label>
                                    <Input
                                        id="edit-amount"
                                        value={editFormData.amount}
                                        onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-duedate">Förfallodatum</Label>
                                    <Input
                                        id="edit-duedate"
                                        type="date"
                                        value={editFormData.dueDate}
                                        onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                            </div>

                            {/* ROT/RUT Fields */}
                            <div className="pt-2 border-t border-dashed">
                                <Label className="block mb-2 font-bold text-gray-700">Skattereduktion (ROT/RUT)</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="rot-rut-type">Typ</Label>
                                        <Select
                                            value={editFormData.rotRutType}
                                            onValueChange={(val) => {
                                                // Auto-calculate labor cost to 30% of total if setting ROT for first time
                                                let newLabor = editFormData.laborCost;
                                                if (val === 'ROT' && !editFormData.laborCost && editFormData.amount) {
                                                    // Standard schablon: arbetskostnad ofta 30% av totalent vid totalentreprenad? 
                                                    // Nej, vi sätter bara fokus. Kunden måste fylla i.
                                                }
                                                setEditFormData({ ...editFormData, rotRutType: val });
                                            }}
                                        >
                                            <SelectTrigger className="premium-input">
                                                <SelectValue placeholder="Ingen" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-black/10">
                                                <SelectItem value="none">Ingen skattereduktion</SelectItem>
                                                <SelectItem value="ROT">ROT-avdrag (30%)</SelectItem>
                                                <SelectItem value="RUT">RUT-avdrag (50%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {editFormData.rotRutType !== 'none' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="labor-cost">Arbetskostnad (kr)</Label>
                                            <Input
                                                id="labor-cost"
                                                value={editFormData.laborCost}
                                                onChange={(e) => setEditFormData({ ...editFormData, laborCost: e.target.value })}
                                                placeholder="Belopp för arbete"
                                                className="premium-input"
                                            />
                                        </div>
                                    )}
                                </div>

                                {editFormData.rotRutType === 'ROT' && (
                                    <div className="space-y-2 mt-4">
                                        <Label htmlFor="property-designation">Fastighetsbeteckning</Label>
                                        <Input
                                            id="property-designation"
                                            value={editFormData.propertyDesignation}
                                            onChange={(e) => setEditFormData({ ...editFormData, propertyDesignation: e.target.value })}
                                            placeholder="T.ex. Stockholm Bilen 3"
                                            className="premium-input"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                    value={editFormData.status}
                                    onValueChange={(val) => setEditFormData({ ...editFormData, status: val })}
                                >
                                    <SelectTrigger className="premium-input">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-black/10">
                                        <SelectItem value="draft">Utkast</SelectItem>
                                        <SelectItem value="sent">Skickad</SelectItem>
                                        <SelectItem value="paid">Betald</SelectItem>
                                        <SelectItem value="overdue">Förfallen</SelectItem>
                                        <SelectItem value="cancelled">Makulerad</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 justify-end">
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="border-black/10">Avbryt</Button>
                            <Button type="submit" className="premium-button">Spara ändringar</Button>
                        </div>
                    </form>
                </ResponsiveDialogContent>
            </ResponsiveDialog>
        </div >
    );
};

export default Invoices;
