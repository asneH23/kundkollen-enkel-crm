import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pdf } from "@react-pdf/renderer";
import QuotePDF from "@/components/pdf/QuotePDF";
import QuoteCard from "@/components/QuoteCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, Plus, Search, Users, Calendar, Pencil, Mail, Send, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import MobileQuoteList from "@/components/MobileQuoteList";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogTrigger
} from "@/components/ui/responsive-dialog";
import confetti from "canvas-confetti";

interface Quote {
  id: string;
  title: string;
  amount: number | null;
  status: string | null;
  customer_id: string | null;
  created_at: string;
  description?: string | null;
  rot_rut_type?: 'ROT' | 'RUT' | null;
  rot_rut_amount?: number;
  labor_cost?: number;
  property_designation?: string;
}

interface Customer {
  id: string;
  company_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface QuoteFormData {
  title: string;
  amount: string;
  status: string;
  customerId: string;
  description: string;
  rotRutType: string;
  laborCost: string;
  propertyDesignation: string;
}

const Quotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus === "draft" || urlStatus === "sent" || urlStatus === "accepted" || urlStatus === "all") {
      return urlStatus;
    }
    return "all";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sendQuoteOpen, setSendQuoteOpen] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [userProfile, setUserProfile] = useState<{ company_name: string | null; phone: string | null; email: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  // Automation state
  const [invoiceSuccessOpen, setInvoiceSuccessOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<{ id: string; invoice_number: number } | null>(null);

  const [formData, setFormData] = useState<QuoteFormData>({
    title: "",
    amount: "",
    status: "draft",
    customerId: "none",
    description: "",
    rotRutType: "none",
    laborCost: "",
    propertyDesignation: ""
  });

  const fetchQuotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte hämta offerter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, company_name, email, phone, address")
        .eq("user_id", user.id)
        .order("company_name");

      if (error) throw error;
      setCustomers((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte hämta kunder",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchQuotes();
    fetchCustomers();
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("company_name, business_email, phone, address")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const profileData = data as any;
      const phone = profileData?.phone || localStorage.getItem(`profile_phone_${user.id}`);
      const businessEmail = profileData?.business_email || localStorage.getItem(`profile_business_email_${user.id}`);

      setUserProfile({
        company_name: profileData?.company_name || null,
        phone: phone || null,
        email: businessEmail || user.email || "",
      });
    } catch (error) {
      // Fallback to user email and localStorage
      const phone = localStorage.getItem(`profile_phone_${user.id}`);
      const businessEmail = localStorage.getItem(`profile_business_email_${user.id}`);

      setUserProfile({
        company_name: null,
        phone: phone || null,
        email: businessEmail || user.email || "",
      });
    }
  };

  // Format number input with spaces (Swedish format: 100 000)
  const formatNumberInput = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";

    // Format with spaces every 3 digits from right
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      status: "draft",
      customerId: "",
      description: "",
      rotRutType: "none",
      laborCost: "",
      propertyDesignation: ""
    });
    setEditingQuote(null);
  };

  const handleOpenDialog = (quote?: Quote) => {
    if (quote) {
      setEditingQuote(quote);
      const formattedAmount = quote.amount ? quote.amount.toLocaleString("sv-SE") : "";
      setFormData({
        title: quote.title,
        amount: formattedAmount,
        status: quote.status || "draft",
        customerId: quote.customer_id || "none",
        description: quote.description || "",
        rotRutType: quote.rot_rut_type || "none",
        laborCost: quote.labor_cost?.toString() || "",
        propertyDesignation: quote.property_designation || ""
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleOpenDetail = (quote: Quote) => {
    // Load description from localStorage if not in database
    const quoteWithDescription = {
      ...quote,
      description: quote.description || null,
    };
    setSelectedQuote(quoteWithDescription);
    setDetailOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) {
      toast({
        title: "Fel",
        description: "Titel är obligatorisk",
        variant: "destructive",
      });
      return;
    }

    try {
      // Remove spaces from amount before parsing
      const amountValue = formData.amount.replace(/\s/g, "").replace(",", ".");
      const laborCostValue = formData.laborCost.replace(/\s/g, "").replace(",", ".");

      const quoteData: any = {
        title: formData.title.trim(),
        amount: amountValue ? parseFloat(amountValue) : null,
        status: formData.status,
        customer_id: formData.customerId === "none" ? null : formData.customerId,
        rot_rut_type: formData.rotRutType === "none" ? null : formData.rotRutType,
        labor_cost: laborCostValue ? parseFloat(laborCostValue) : 0,
        property_designation: formData.propertyDesignation
      };

      // Try to save description to database (if column exists)
      if (formData.description.trim()) {
        quoteData.description = formData.description.trim();
      }

      if (editingQuote) {
        const { error } = await supabase
          .from("quotes")
          .update(quoteData)
          .eq("id", editingQuote.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Uppdaterad",
          description: "Offerten har uppdaterats",
        });

        // Refresh quotes to show updated status
        await fetchQuotes();
        setOpen(false);
        resetForm();
      } else {
        const { data, error } = await supabase.from("quotes").insert({
          user_id: user.id,
          ...quoteData,
        }).select().single();

        if (error) throw error;



        toast({
          title: "Skapad",
          description: "Offerten har skapats",
        });
      }

      handleCloseDialog();
      fetchQuotes();
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || `Kunde inte ${editingQuote ? "uppdatera" : "skapa"} offert`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (quote: Quote) => {
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  const createInvoiceInDb = async (quote: Quote) => {
    if (!user?.id) throw new Error("User not found");

    // 1. Get next invoice number
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_invoice_number' as any)
      .eq('id', user.id)
      .single();

    const nextNumber = (Number((profile as any)?.last_invoice_number) || 1000) + 1;

    // 2. Create invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices' as any)
      .insert({
        user_id: user.id,
        customer_id: quote.customer_id,
        quote_id: quote.id,
        invoice_number: nextNumber,
        amount: quote.amount,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
        status: 'draft',
        description: quote.title,
        rot_rut_type: quote.rot_rut_type,
        labor_cost: quote.labor_cost,
        property_designation: quote.property_designation,
        // Calculate rot_rut_amount for invoice based on labor_cost and type
        rot_rut_amount: quote.rot_rut_type === 'ROT' ? (quote.labor_cost ? quote.labor_cost * 0.3 : 0) :
          quote.rot_rut_type === 'RUT' ? (quote.labor_cost ? quote.labor_cost * 0.5 : 0) : 0
      })
      .select('id, invoice_number')
      .single();

    if (invoiceError) throw invoiceError;

    // 3. Update profile
    await supabase
      .from('profiles')
      .update({ last_invoice_number: nextNumber } as any)
      .eq('id', user.id);

    return (invoiceData as any) as { id: string; invoice_number: number };
  };

  const handleConvertToInvoice = async (quote: Quote) => {
    try {
      const invoiceData = await createInvoiceInDb(quote);

      // Update quote status if needed
      if (quote.status !== 'accepted') {
        await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quote.id);
      }

      toast({
        title: "Faktura skapad",
        description: `Faktura #${invoiceData.invoice_number} har skapats från offerten.`,
      });

      navigate('/fakturor');
    } catch (error: any) {
      console.error(error);
      toast({ title: "Fel", description: "Kunde inte skapa faktura", variant: "destructive" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete || !user) return;

    try {
      const { error } = await supabase.from("quotes").delete().eq("id", quoteToDelete.id);

      if (error) throw error;

      toast({
        title: "Borttagen",
        description: "Offerten har tagits bort",
      });

      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
      fetchQuotes();
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte ta bort offert",
        variant: "destructive",
      });
    }
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return "Ingen kund";
    const customer = customers.find(c => c.id === customerId);
    return customer?.company_name || "Okänd kund";
  };

  const getCustomerEmail = (customerId: string | null) => {
    if (!customerId) return null;
    const customer = customers.find(c => c.id === customerId);
    return customer?.email || null;
  };

  const handleOpenSendQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    // Pre-fill email if customer has email
    const email = getCustomerEmail(quote.customer_id);
    setCustomerEmail(email || "");

    // Create professional email template
    const customerName = quote.customer_id ? getCustomerName(quote.customer_id) : "";
    const greeting = customerName ? `Hej ${customerName}!` : "Hej!";
    const description = quote.description || "";

    const professionalMessage = `${greeting}

Jag skickar härmed en offert för ${quote.title}.

${description ? `\n${description}\n` : ""}

${quote.amount ? `Totalt belopp: ${quote.amount.toLocaleString("sv-SE")} kr` : ""}

Offerten är giltig i 30 dagar från datum nedan.

Vid frågor, tveka inte att kontakta mig.

Med vänliga hälsningar${userProfile?.company_name ? `,\n${userProfile.company_name}` : ""}`;

    setEmailMessage(professionalMessage);
    setSendQuoteOpen(true);
  };

  const handleSendQuote = async () => {
    if (!selectedQuote || !customerEmail.trim()) {
      toast({
        title: "Fel",
        description: "Vänligen ange kundens email-adress",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      toast({
        title: "Ogiltig email",
        description: "Vänligen ange en giltig email-adress",
        variant: "destructive",
      });
      return;
    }

    setSendingQuote(true);

    try {
      const subject = `Offert: ${selectedQuote.title}`;

      // Get customer details
      const customer = customers.find(c => c.id === selectedQuote.customer_id);

      // Generate PDF blob
      const blob = await pdf(
        <QuotePDF
          quote={selectedQuote}
          customer={{
            name: customer?.company_name || 'Okänd kund',
            email: customer?.email,
            phone: customer?.phone,
            company: customer?.company_name,
            address: customer?.address,
          }}
          companyInfo={userProfile ? {
            name: userProfile.company_name || 'Kundkollen',
            email: userProfile.email,
            phone: userProfile.phone || undefined,
          } : undefined}
        />
      ).toBlob();

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const pdfBase64 = base64data.split(',')[1];

          // Create HTML body
          const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 16px; }
                .header { background-color: #16A34A; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
                .content { background-color: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
                .quote-box { background-color: #f8fafc; padding: 24px; border-radius: 8px; border-left: 6px solid #16A34A; margin: 24px 0; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                 <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Offert från ${userProfile?.company_name || 'oss'}</h1>
              </div>
              <div class="content">
                <p style="margin-bottom: 24px;">${emailMessage.replace(/\n/g, '<br>')}</p>
                
                <div class="quote-box">
                    <p style="margin: 0; font-weight: 600; color: #111827;">Offerten bifogas som PDF.</p>
                    <p style="margin-top: 8px; font-size: 14px; color: #4b5563;">
                        Giltig till: ${new Date(new Date(selectedQuote.created_at).setDate(new Date(selectedQuote.created_at).getDate() + 30)).toLocaleDateString("sv-SE")}
                    </p>
                </div>

                <div class="footer">
                  <p>Med vänliga hälsningar,<br><strong>${userProfile?.company_name || "Kundkollen"}</strong></p>
                  <p style="font-size: 12px; margin-top: 10px; color: #9ca3af;">Skickat via Kundkollen CRM</p>
                </div>
              </div>
            </body>
            </html>
          `;

          // Call Edge Function
          const { error } = await supabase.functions.invoke('send-quote-email', {
            body: {
              to: [customerEmail.trim()],
              subject: subject,
              html: htmlBody,
              pdfBase64: pdfBase64,
              filename: `offert-${selectedQuote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
              replyTo: userProfile?.email,
              fromName: userProfile?.company_name || "Kundkollen Användare"
            }
          });

          if (error) throw error;

          // Update quote status
          if (selectedQuote.status !== "sent") {
            await supabase
              .from("quotes")
              .update({ status: "sent" })
              .eq("id", selectedQuote.id);

            fetchQuotes();
          }

          toast({
            title: "Offert skickad!",
            description: "E-post med PDF har skickats till kunden.",
          });

          setSendQuoteOpen(false);
          setCustomerEmail("");
          setEmailMessage("");
        } catch (error: any) {
          console.error("Error sending email:", error);
          toast({
            title: "Kunde inte skicka email",
            description: error.message || "Ett fel uppstod vid utskick",
            variant: "destructive",
          });
        } finally {
          setSendingQuote(false);
        }
      };
    } catch (error: any) {
      console.error("Error preparing email:", error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte förbereda utskick",
        variant: "destructive",
      });
      setSendingQuote(false);
    }
  };

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case "accepted": return "default";
      case "sent": return "secondary";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "accepted": return "Accepterad";
      case "sent": return "Skickad";
      case "draft": return "Utkast";
      default: return "Okänd";
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    if (!matchesStatus) return false;

    const term = searchTerm.toLowerCase();
    if (!term) return true;

    const customerName = getCustomerName(quote.customer_id).toLowerCase();
    return (
      quote.title.toLowerCase().includes(term) ||
      customerName.includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-primary">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 mt-4 lg:mt-0">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 tracking-tight">Offerter</h1>
          <p className="text-primary/70 text-lg">Hantera dina affärer och skapa nya möjligheter.</p>
        </div>
        <ResponsiveDialog open={open} onOpenChange={setOpen}>
          <ResponsiveDialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="premium-button">
              <Plus className="mr-2 h-4 w-4" />
              Skapa offert
            </Button>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogContent className="bg-white border border-black/10 text-primary sm:max-w-[600px] rounded-3xl">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle className="text-2xl font-bold">
                {editingQuote ? "Redigera offert" : "Skapa ny offert"}
              </ResponsiveDialogTitle>
            </ResponsiveDialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-primary">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="T.ex. Renovering av badrum"
                    required
                    className="premium-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-primary">Kund</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                    >
                      <SelectTrigger className="premium-input">
                        <SelectValue placeholder="Välj kund (valfritt)" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel border-black/10 text-primary">
                        <SelectItem value="none" className="focus:bg-black/10 focus:text-primary">Ingen kund</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id} className="focus:bg-black/10 focus:text-primary">
                            {customer.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-primary">Belopp (kr)</Label>
                    <Input
                      id="amount"
                      type="text"
                      value={formData.amount}
                      onChange={(e) => {
                        const formatted = formatNumberInput(e.target.value);
                        setFormData({ ...formData, amount: formatted });
                      }}
                      placeholder="100 000"
                      className="premium-input"
                    />
                  </div>
                </div>

                {/* ROT/RUT Fields */}
                <div className="pt-2 border-t border-dashed">
                  <Label className="block mb-2 font-bold text-gray-700">Skattereduktion (ROT/RUT)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rot-rut-type" className="text-primary">Typ</Label>
                      <Select
                        value={formData.rotRutType}
                        onValueChange={(val) => {
                          setFormData({ ...formData, rotRutType: val });
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

                    {formData.rotRutType !== 'none' && (
                      <div className="space-y-2">
                        <Label htmlFor="labor-cost" className="text-primary">Arbetskostnad (kr)</Label>
                        <Input
                          id="labor-cost"
                          value={formData.laborCost}
                          onChange={(e) => {
                            const formatted = formatNumberInput(e.target.value);
                            setFormData({ ...formData, laborCost: formatted });
                          }}
                          placeholder="Belopp för arbete"
                          className="premium-input"
                        />
                      </div>
                    )}
                  </div>

                  {formData.rotRutType === 'ROT' && (
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="property-designation" className="text-primary">Fastighetsbeteckning</Label>
                      <Input
                        id="property-designation"
                        value={formData.propertyDesignation}
                        onChange={(e) => setFormData({ ...formData, propertyDesignation: e.target.value })}
                        placeholder="T.ex. Stockholm Bilen 3"
                        className="premium-input"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-primary">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="premium-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-black/10 text-primary">
                      <SelectItem value="draft" className="focus:bg-black/10 focus:text-primary">Utkast</SelectItem>
                      <SelectItem value="sent" className="focus:bg-black/10 focus:text-primary">Skickad</SelectItem>
                      <SelectItem value="accepted" className="focus:bg-black/10 focus:text-primary">Accepterad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-primary">Beskrivning (valfritt)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Lägg till mer information om offerten..."
                    rows={4}
                    className="premium-input resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" className="premium-button flex-1 h-11">
                  {editingQuote ? "Uppdatera" : "Skapa"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="h-11 border-black/10 text-primary hover:bg-black/5 hover:text-accent"
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </ResponsiveDialogContent>
        </ResponsiveDialog>

        {/* Detail View Dialog */}
        <ResponsiveDialog open={detailOpen} onOpenChange={setDetailOpen}>
          <ResponsiveDialogContent className="bg-white border border-black/10 text-primary max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
            {selectedQuote && (
              <>
                <ResponsiveDialogHeader>
                  <ResponsiveDialogTitle className="text-3xl font-bold tracking-tight">{selectedQuote.title}</ResponsiveDialogTitle>
                  <ResponsiveDialogDescription className="text-primary/70">
                    Offert skapad {new Date(selectedQuote.created_at).toLocaleDateString("sv-SE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </ResponsiveDialogDescription>
                </ResponsiveDialogHeader>

                <div className="space-y-8 mt-6">
                  {/* Status and Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 rounded-xl bg-black/5 border border-black/5">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-primary/70 uppercase tracking-wider font-medium">Status</span>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "text-sm px-3 py-1 border-0",
                            selectedQuote.status === "accepted" && "bg-accent/20 text-accent",
                            selectedQuote.status === "sent" && "bg-blue-500/20 text-blue-400",
                            selectedQuote.status === "draft" && "bg-black/10 text-primary"
                          )}
                        >
                          {getStatusLabel(selectedQuote.status)}
                        </Badge>
                        <Select
                          value={selectedQuote.status || "draft"}
                          onValueChange={async (value) => {
                            try {
                              const { error } = await supabase
                                .from("quotes")
                                .update({ status: value })
                                .eq("id", selectedQuote.id);

                              if (error) throw error;

                              setSelectedQuote({ ...selectedQuote, status: value });
                              fetchQuotes();

                              toast({
                                title: "Status uppdaterad",
                                description: `Offerten är nu markerad som "${getStatusLabel(value)}"`,
                              });
                            } catch (error: any) {
                              toast({
                                title: "Fel",
                                description: error.message || "Kunde inte uppdatera status",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-32 h-8 bg-transparent border-black/10 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-panel border-black/10 text-primary">
                            <SelectItem value="draft" className="focus:bg-black/10 focus:text-primary">Utkast</SelectItem>
                            <SelectItem value="sent" className="focus:bg-black/10 focus:text-primary">Skickad</SelectItem>
                            <SelectItem value="accepted" className="focus:bg-black/10 focus:text-primary">Accepterad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:text-right">
                      <span className="text-sm text-primary/70 uppercase tracking-wider font-medium">Belopp</span>
                      {selectedQuote.amount ? (
                        <div className="text-3xl font-bold text-primary tracking-tight">
                          {selectedQuote.amount.toLocaleString("sv-SE")} <span className="text-lg text-primary/60 font-normal">kr</span>
                        </div>
                      ) : (
                        <span className="text-primary/60 italic">Ej angivet</span>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  {selectedQuote.customer_id && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-black/5 hover:bg-black/5 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-primary/70 uppercase tracking-wider font-medium mb-0.5">Kund</p>
                        <p className="font-semibold text-primary text-lg">{getCustomerName(selectedQuote.customer_id)}</p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary">Beskrivning</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDetailOpen(false);
                          handleOpenDialog(selectedQuote);
                        }}
                        className="text-primary/70 hover:text-accent hover:bg-black/10"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Redigera
                      </Button>
                    </div>
                    <div className="p-6 rounded-xl bg-black/5 border border-black/5 min-h-[100px]">
                      {selectedQuote.description ? (
                        <p className="text-primary/90 whitespace-pre-wrap leading-relaxed">
                          {selectedQuote.description}
                        </p>
                      ) : (
                        <p className="text-primary/60 italic">Ingen beskrivning tillagd ännu.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-6 border-t border-black/10">
                    <Button
                      className="premium-button w-full h-12 text-base"
                      onClick={() => {
                        setDetailOpen(false);
                        handleOpenSendQuote(selectedQuote);
                      }}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Skicka offert till kund
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 h-11 border-black/10 text-primary hover:bg-black/5 hover:text-accent"
                        onClick={() => {
                          setDetailOpen(false);
                          handleOpenDialog(selectedQuote);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Redigera
                      </Button>
                      <Button
                        variant="outline"
                        className="h-11 border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
                        onClick={() => {
                          setDetailOpen(false);
                          handleDeleteClick(selectedQuote);
                        }}
                      >
                        Ta bort
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </ResponsiveDialogContent>
        </ResponsiveDialog>

        {/* Send Quote Dialog */}
        <ResponsiveDialog open={sendQuoteOpen} onOpenChange={setSendQuoteOpen}>
          <ResponsiveDialogContent className="bg-white border border-black/10 text-primary max-w-lg rounded-3xl">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-5 w-5 text-accent" />
                Skicka offert till kund
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription className="text-primary/70">
                Fyll i kundens email-adress för att skicka offerten
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            {selectedQuote && (
              <div className="space-y-6 mt-4">
                <div className="p-4 rounded-lg bg-black/5 border border-black/5">
                  <p className="text-xs text-primary/70 uppercase tracking-wider font-medium mb-1">Offert</p>
                  <p className="font-semibold text-primary text-lg">{selectedQuote.title}</p>
                  {selectedQuote.amount && (
                    <p className="text-xl font-bold text-accent mt-1">
                      {selectedQuote.amount.toLocaleString("sv-SE")} kr
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail" className="text-primary">Kundens email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="kund@example.com"
                    className="premium-input"
                    required
                  />
                  {selectedQuote.customer_id && getCustomerEmail(selectedQuote.customer_id) && (
                    <p className="text-xs text-primary/70 mt-1">
                      Kundens sparade email: {getCustomerEmail(selectedQuote.customer_id)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailMessage" className="text-primary">Meddelande (valfritt)</Label>
                  <Textarea
                    id="emailMessage"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Skriv ett personligt meddelande till kunden..."
                    rows={6}
                    className="premium-input resize-none"
                  />
                  <p className="text-xs text-primary/70">
                    Offertdetaljer läggs automatiskt till i slutet av meddelandet
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleSendQuote}
                    disabled={sendingQuote || !customerEmail.trim()}
                    className="premium-button flex-1 h-11"
                  >
                    {sendingQuote ? (
                      <>
                        <Mail className="h-4 w-4 mr-2 animate-pulse" />
                        Skickar...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Skicka offert
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSendQuoteOpen(false);
                      setCustomerEmail("");
                      setEmailMessage("");
                    }}
                    className="h-11 border-black/10 text-primary hover:bg-black/5 hover:text-accent"
                  >
                    Avbryt
                  </Button>
                </div>

                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-900/70">
                    <strong>Info:</strong> Offerten skickas som PDF till kunden via email. En kopia sparas i systemet.
                  </p>
                </div>
              </div>
            )}
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </div>

      {/* Stats Section - Black Hero Card */}
      <div className="bg-black rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 flex-shrink-0">
                <FileText className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-1">
                  {quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.amount || 0), 0).toLocaleString('sv-SE')}
                  <span className="text-xl sm:text-2xl text-white/60 font-normal ml-2 sm:ml-3">kr</span>
                </div>
                <p className="text-white/60 text-base sm:text-lg">Totalt värde av accepterade offerter</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="bg-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-bold text-white">{quotes.length}</div>
                <div className="text-white/60 text-xs sm:text-sm">Totalt</div>
              </div>
              <div className="bg-accent/20 rounded-2xl p-3 sm:p-4 border border-accent/30">
                <div className="text-xl sm:text-2xl font-bold text-accent">{quotes.filter(q => q.status === 'accepted').length}</div>
                <div className="text-accent text-xs sm:text-sm">Accepterade</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {/* Filters */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 mb-6 md:static md:bg-transparent md:border-0 md:p-0 md:m-0 md:mb-8 md:pb-6 md:border-b md:border-black/5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60 pointer-events-none" />
            <Input
              placeholder="Sök på titel eller kund"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input pl-10 h-11 text-base shadow-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-11 premium-input text-base shadow-sm">
              <SelectValue placeholder="Filtera status" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-black/10 text-primary">
              <SelectItem value="all" className="focus:bg-black/10 focus:text-primary">Alla statusar</SelectItem>
              <SelectItem value="draft" className="focus:bg-black/10 focus:text-primary">Utkast</SelectItem>
              <SelectItem value="sent" className="focus:bg-black/10 focus:text-primary">Skickad</SelectItem>
              <SelectItem value="accepted" className="focus:bg-black/10 focus:text-primary">Accepterad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border-dashed border-black/10">
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20 shadow-glow">
            <FileText className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-3">
            {quotes.length === 0 ? "Inga offerter ännu" : "Inga offerter matchar din sökning"}
          </h3>
          <p className="text-primary/70 mb-8 max-w-md mx-auto">
            {quotes.length === 0
              ? "Skapa din första offert för att komma igång med din försäljning."
              : "Prova att ändra din sökning eller filtrera för att hitta det du letar efter."}
          </p>
          {quotes.length === 0 && (
            <Button onClick={() => handleOpenDialog()} className="premium-button px-8 py-6 text-lg">
              <Plus className="h-5 w-5 mr-2" />
              Skapa din första offert
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile List View */}
          <MobileQuoteList
            quotes={filteredQuotes.map(quote => ({
              ...quote,
              customer_name: getCustomerName(quote.customer_id)
            }))}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteClick}
            onView={handleOpenDetail}
          />

          {/* Desktop Grid View */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={{
                  ...quote,
                  customer_name: getCustomerName(quote.customer_id)
                }}
                onEdit={() => handleOpenDialog(quote)}
                onDelete={() => handleDeleteClick(quote)}
                onConvertToInvoice={handleConvertToInvoice}
                onStatusChange={async (id, status) => {
                  if (status === "sent") {
                    handleOpenSendQuote(quote);
                    return;
                  }

                  try {
                    // Update status
                    const { error } = await supabase
                      .from("quotes")
                      .update({ status })
                      .eq("id", id);

                    if (error) throw error;

                    // If accepted -> Automate invoice creation
                    if (status === 'accepted') {
                      try {
                        const invoiceData = await createInvoiceInDb(quote);
                        setCreatedInvoice(invoiceData);
                        setInvoiceSuccessOpen(true);
                        confetti({
                          particleCount: 100,
                          spread: 70,
                          origin: { y: 0.6 }
                        });
                      } catch (err) {
                        console.error("Could not auto-create invoice", err);
                        toast({ title: "Kunde inte skapa faktura automatiskt", variant: "destructive" });
                      }
                    }

                    fetchQuotes();
                    toast({
                      title: "Status uppdaterad",
                      description: `Offerten har markerats som ${status === 'accepted' ? 'accepterad' : status === 'rejected' ? 'avvisad' : 'utkast'}`,
                    });
                  } catch (error: any) {
                    toast({
                      title: "Fel",
                      description: "Kunde inte uppdatera status",
                      variant: "destructive",
                    });
                  }
                }}
                onClick={() => handleOpenDetail(quote)}
                companyInfo={userProfile ? {
                  name: userProfile.company_name || 'Kundkollen',
                  email: userProfile.email,
                  phone: userProfile.phone || undefined,
                } : undefined}
              />
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-black/10 text-primary sm:max-w-[500px] rounded-3xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold">
                Ta bort offert?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-primary/70 pt-2">
              <p>
                Är du säker på att du vill ta bort <strong>{quoteToDelete?.title}</strong>?
              </p>
              <p className="mt-3 text-sm">
                Denna åtgärd kan inte ångras.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
            <AlertDialogCancel className="h-11 border-black/10 text-primary hover:bg-black/5 hover:text-accent">
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white h-11"
            >
              Ta bort ändå
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Created Success Dialog */}
      <ResponsiveDialog open={invoiceSuccessOpen} onOpenChange={setInvoiceSuccessOpen}>
        <ResponsiveDialogContent className="sm:max-w-[450px] bg-white border border-black/10 text-primary rounded-3xl">
          <ResponsiveDialogHeader>
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <ResponsiveDialogTitle className="text-center text-2xl font-bold">Grattis till affären!</ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="text-center text-primary/70 text-lg pt-2">
              Offerten är accepterad och <strong>Faktura #{createdInvoice?.invoice_number}</strong> har skapats automatiskt.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={() => navigate(`/fakturor?action=send&invoiceId=${createdInvoice?.id}`)}
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90 rounded-xl"
            >
              <Send className="w-5 h-5 mr-2" /> Skicka faktura nu
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/fakturor')}
              className="w-full h-12 text-lg border-2 border-black/5 hover:bg-black/5 rounded-xl"
            >
              <FileText className="w-5 h-5 mr-2" /> Granska faktura
            </Button>
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div >
  );
};

export default Quotes;
