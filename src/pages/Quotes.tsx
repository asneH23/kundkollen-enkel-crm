import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuoteCard from "@/components/QuoteCard";
import { useSearchParams } from "react-router-dom";
import { FileText, Plus, Search, Users, Calendar, Pencil, Mail, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Quote {
  id: string;
  title: string;
  amount: number | null;
  status: string | null;
  customer_id: string | null;
  created_at: string;
  description?: string | null;
}

interface Customer {
  id: string;
  company_name: string;
  email?: string | null;
}

interface QuoteFormData {
  title: string;
  amount: string;
  status: string;
  customerId: string;
  description: string;
}

const Quotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [formData, setFormData] = useState<QuoteFormData>({
    title: "",
    amount: "",
    status: "draft",
    customerId: "none",
    description: "",
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
        .select("id, company_name, email")
        .eq("user_id", user.id)
        .order("company_name");

      if (error) throw error;
      setCustomers(data || []);
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
        .select("company_name, email")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const phone = localStorage.getItem(`profile_phone_${user.id}`);
      setUserProfile({
        company_name: data?.company_name || null,
        phone: phone || null,
        email: data?.email || user.email || "",
      });
    } catch (error) {
      // Fallback to user email
      setUserProfile({
        company_name: null,
        phone: null,
        email: user.email || "",
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
        description: (quote.description || localStorage.getItem(`quote_description_${quote.id}`)) || "",
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
      description: quote.description || localStorage.getItem(`quote_description_${quote.id}`) || null,
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
      const quoteData: any = {
        title: formData.title.trim(),
        amount: amountValue ? parseFloat(amountValue) : null,
        status: formData.status,
        customer_id: formData.customerId === "none" ? null : formData.customerId,
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
          // If description column doesn't exist, save to localStorage
          if (error.message?.includes("column") || error.message?.includes("does not exist")) {
            if (formData.description.trim()) {
              localStorage.setItem(`quote_description_${editingQuote.id}`, formData.description.trim());
            } else {
              localStorage.removeItem(`quote_description_${editingQuote.id}`);
            }
            // Retry update without description
            const { error: retryError } = await supabase
              .from("quotes")
              .update({
                title: quoteData.title,
                amount: quoteData.amount,
                status: quoteData.status,
                customer_id: quoteData.customer_id,
              })
              .eq("id", editingQuote.id);
            
            if (retryError) throw retryError;
          } else {
            throw error;
          }
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

        // Save description to localStorage if database doesn't support it
        if (data && formData.description.trim() && !quoteData.description) {
          localStorage.setItem(`quote_description_${data.id}`, formData.description.trim());
        }

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

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna offert?")) return;

    try {
      const { error } = await supabase.from("quotes").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Borttagen",
        description: "Offerten har tagits bort",
      });

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
    const description = quote.description || localStorage.getItem(`quote_description_${quote.id}`) || "";
    
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
      // Create professional email content
      const subject = `Offert: ${selectedQuote.title}`;
      const description = selectedQuote.description || localStorage.getItem(`quote_description_${selectedQuote.id}`) || "";
      const customerName = selectedQuote.customer_id ? getCustomerName(selectedQuote.customer_id) : "";
      
      // Professional email body with better formatting
      const offertDate = new Date(selectedQuote.created_at).toLocaleDateString("sv-SE", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
      const validUntil = new Date(selectedQuote.created_at);
      validUntil.setDate(validUntil.getDate() + 30);
      const validUntilDate = validUntil.toLocaleDateString("sv-SE", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });

      const emailBody = `${emailMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFERTDETALJER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Projekt: ${selectedQuote.title}
${selectedQuote.amount ? `Totalt belopp: ${selectedQuote.amount.toLocaleString("sv-SE")} kr` : "Belopp: Enligt överenskommelse"}
${description ? `\nBeskrivning:\n${description}` : ""}
${customerName ? `Kund: ${customerName}` : ""}
Offertdatum: ${offertDate}
Giltig till: ${validUntilDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KONTAKTINFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${userProfile?.company_name ? `${userProfile.company_name}\n` : ""}${userProfile?.phone ? `Telefon: ${userProfile.phone}\n` : ""}Email: ${userProfile?.email || ""}

${userProfile?.company_name ? `\nMed vänliga hälsningar,\n${userProfile.company_name}` : "\nMed vänliga hälsningar"}`;

      // Use mailto link (works immediately, no backend needed)
      const mailtoLink = `mailto:${customerEmail.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;

      // Update quote status to "sent" if not already
      if (selectedQuote.status !== "sent") {
        const { error } = await supabase
          .from("quotes")
          .update({ status: "sent" })
          .eq("id", selectedQuote.id);

        if (error) {
          console.error("Error updating quote status:", error);
        } else {
          // Refresh quotes
          fetchQuotes();
        }
      }

      toast({
        title: "Offert skickad!",
        description: "Din email-klient öppnas för att skicka offerten.",
      });

      setSendQuoteOpen(false);
      setCustomerEmail("");
      setEmailMessage("");
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte skicka offert",
        variant: "destructive",
      });
    } finally {
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">Offerter</h1>
          <p className="text-sm sm:text-base text-secondary/80">Följ upp dina offerter och affärer</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              Skapa offert
            </Button>
          </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingQuote ? "Redigera offert" : "Skapa ny offert"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="T.ex. Renovering av badrum"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Kund</Label>
                  <Select 
                    value={formData.customerId} 
                    onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kund (valfritt)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen kund</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Belopp (kr)</Label>
                  <Input
                    id="amount"
                    type="text"
                    value={formData.amount}
                    onChange={(e) => {
                      const formatted = formatNumberInput(e.target.value);
                      setFormData({ ...formData, amount: formatted });
                    }}
                    placeholder="100 000"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Utkast</SelectItem>
                      <SelectItem value="sent">Skickad</SelectItem>
                      <SelectItem value="accepted">Accepterad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Beskrivning (valfritt)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Lägg till mer information om offerten..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1 min-h-[44px]">
                    {editingQuote ? "Uppdatera" : "Skapa"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseDialog} className="min-h-[44px]">
                    Avbryt
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-300">
          {selectedQuote && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedQuote.title}</DialogTitle>
                <DialogDescription>
                  Offert skapad {new Date(selectedQuote.created_at).toLocaleDateString("sv-SE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Status and Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={cn(
                          "text-sm px-3 py-1",
                          selectedQuote.status === "accepted" && "bg-accent/20 text-accent border-accent/30",
                          selectedQuote.status === "sent" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                          selectedQuote.status === "draft" && "bg-secondary/20 text-secondary border-border"
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
                            
                            // Update local state
                            setSelectedQuote({ ...selectedQuote, status: value });
                            // Refresh quotes list
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
                        <SelectTrigger className="w-full sm:w-36 h-9 min-h-[44px] sm:min-h-0 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Utkast</SelectItem>
                          <SelectItem value="sent">Skickad</SelectItem>
                          <SelectItem value="accepted">Accepterad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedQuote.amount && (
                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      {selectedQuote.amount.toLocaleString("sv-SE")} kr
                    </div>
                  )}
                </div>

                {/* Customer Info */}
                {selectedQuote.customer_id && (
                  <div className="flex items-center gap-3 p-4 rounded bg-muted/50 border border-border">
                    <Users className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm text-secondary">Kund</p>
                      <p className="font-semibold text-primary">{getCustomerName(selectedQuote.customer_id)}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-primary">Beskrivning</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDetailOpen(false);
                        handleOpenDialog(selectedQuote);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Redigera
                    </Button>
                  </div>
                  <div className="p-4 rounded bg-muted/30 border border-border min-h-[100px]">
                    {selectedQuote.description || localStorage.getItem(`quote_description_${selectedQuote.id}`) ? (
                      <p className="text-primary whitespace-pre-wrap">
                        {selectedQuote.description || localStorage.getItem(`quote_description_${selectedQuote.id}`) || ""}
                      </p>
                    ) : (
                      <p className="text-secondary italic">Ingen beskrivning tillagd ännu.</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button
                    className="w-full min-h-[44px]"
                    onClick={() => {
                      setDetailOpen(false);
                      handleOpenSendQuote(selectedQuote);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Skicka offert till kund
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 min-h-[44px]"
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
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 min-h-[44px]"
                      onClick={() => {
                        setDetailOpen(false);
                        handleDelete(selectedQuote.id);
                      }}
                    >
                      Ta bort
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Quote Dialog */}
      <Dialog open={sendQuoteOpen} onOpenChange={setSendQuoteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Skicka offert till kund
            </DialogTitle>
            <DialogDescription>
              Fyll i kundens email-adress för att skicka offerten
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded bg-muted/50 border border-border">
                <p className="text-sm text-secondary mb-1">Offert</p>
                <p className="font-semibold text-primary">{selectedQuote.title}</p>
                {selectedQuote.amount && (
                  <p className="text-lg font-bold text-accent mt-2">
                    {selectedQuote.amount.toLocaleString("sv-SE")} kr
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerEmail">Kundens email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="kund@example.com"
                  className="mt-2"
                  required
                />
                {selectedQuote.customer_id && getCustomerEmail(selectedQuote.customer_id) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Kundens sparade email: {getCustomerEmail(selectedQuote.customer_id)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="emailMessage">Meddelande (valfritt)</Label>
                <Textarea
                  id="emailMessage"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Skriv ett personligt meddelande till kunden..."
                  rows={6}
                  className="mt-2 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Offertdetaljer läggs automatiskt till i slutet av meddelandet
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={handleSendQuote}
                  disabled={sendingQuote || !customerEmail.trim()}
                  className="flex-1 min-h-[44px]"
                >
                  {sendingQuote ? (
                    <>
                      <Mail className="h-4 w-4 mr-2 animate-pulse" />
                      Skickar...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Öppna email-klient
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
                  className="min-h-[44px]"
                >
                  Avbryt
                </Button>
              </div>

              <div className="p-3 rounded bg-muted/30 border border-border">
                <p className="text-xs text-secondary">
                  <strong>Obs:</strong> Din standard email-klient öppnas med offerten förfylld. 
                  Du kan redigera meddelandet innan du skickar.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-border/30">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary/60" />
          <Input
            placeholder="Sök på titel eller kund"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-card/50 border-border/50 focus:border-accent/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtera status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla statusar</SelectItem>
            <SelectItem value="draft">Utkast</SelectItem>
            <SelectItem value="sent">Skickad</SelectItem>
            <SelectItem value="accepted">Accepterad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-12 sm:p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 rounded bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20">
                <FileText className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-3">
                {quotes.length === 0 ? "Inga offerter ännu" : "Inga offerter matchar dina filter"}
              </h3>
              <p className="text-secondary/80 mb-8 text-sm sm:text-base">
                {quotes.length === 0
                  ? "Börja med att skapa din första offert för att komma igång."
                  : "Prova att ändra dina filter för att hitta fler resultat."}
              </p>
              {quotes.length === 0 && (
                <Button onClick={() => handleOpenDialog()} size="lg" className="min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  Skapa din första offert
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              title={quote.title}
              customerName={getCustomerName(quote.customer_id)}
              amount={quote.amount}
              status={quote.status}
              createdAt={quote.created_at}
              onEdit={() => handleOpenDialog(quote)}
              onDelete={() => handleDelete(quote.id)}
              onClick={() => handleOpenDetail(quote)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Quotes;
