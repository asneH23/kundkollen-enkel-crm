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
        description: quote.description || "",
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
      // Create professional email content
      const subject = `Offert: ${selectedQuote.title}`;
      const description = selectedQuote.description || "";
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
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-2 tracking-tight">Offerter</h1>
          <p className="text-secondary-foreground/60 text-lg">Hantera dina affärer och skapa nya möjligheter.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="premium-button">
              <Plus className="mr-2 h-4 w-4" />
              Skapa offert
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-black/10 text-primary sm:max-w-[600px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingQuote ? "Redigera offert" : "Skapa ny offert"}
              </DialogTitle>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>

        {/* Detail View Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="bg-white border border-black/10 text-primary max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
            {selectedQuote && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">{selectedQuote.title}</DialogTitle>
                  <DialogDescription className="text-secondary-foreground/60">
                    Offert skapad {new Date(selectedQuote.created_at).toLocaleDateString("sv-SE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 mt-6">
                  {/* Status and Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 rounded-xl bg-black/5 border border-black/5">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-secondary-foreground/60 uppercase tracking-wider font-medium">Status</span>
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
                      <span className="text-sm text-secondary-foreground/60 uppercase tracking-wider font-medium">Belopp</span>
                      {selectedQuote.amount ? (
                        <div className="text-3xl font-bold text-primary tracking-tight">
                          {selectedQuote.amount.toLocaleString("sv-SE")} <span className="text-lg text-secondary-foreground/40 font-normal">kr</span>
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
                        <p className="text-xs text-secondary-foreground/60 uppercase tracking-wider font-medium mb-0.5">Kund</p>
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
                        className="text-secondary-foreground/60 hover:text-accent hover:bg-black/10"
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
          <DialogContent className="bg-white border border-black/10 text-primary max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-5 w-5 text-accent" />
                Skicka offert till kund
              </DialogTitle>
              <DialogDescription className="text-secondary-foreground/60">
                Fyll i kundens email-adress för att skicka offerten
              </DialogDescription>
            </DialogHeader>

            {selectedQuote && (
              <div className="space-y-6 mt-4">
                <div className="p-4 rounded-lg bg-black/5 border border-black/5">
                  <p className="text-xs text-secondary-foreground/60 uppercase tracking-wider font-medium mb-1">Offert</p>
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
                    <p className="text-xs text-secondary-foreground/60 mt-1">
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
                  <p className="text-xs text-secondary-foreground/60">
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
                    className="h-11 border-black/10 text-primary hover:bg-black/5 hover:text-accent"
                  >
                    Avbryt
                  </Button>
                </div>

                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-200">
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
      <div className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-black/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
          <Input
            placeholder="Sök på titel eller kund"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 premium-input">
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

      {/* Quotes Grid */}
      {
        filteredQuotes.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center border-dashed border-black/10">
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20 shadow-glow">
              <FileText className="h-10 w-10 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-3">
              {quotes.length === 0 ? "Inga offerter ännu" : "Inga offerter matchar dina filter"}
            </h3>
            <p className="text-secondary-foreground/60 mb-8 max-w-md mx-auto">
              {quotes.length === 0
                ? "Börja med att skapa din första offert för att komma igång med din försäljning."
                : "Prova att ändra dina filter eller söktermer för att hitta det du letar efter."}
            </p>
            {quotes.length === 0 && (
              <Button onClick={() => handleOpenDialog()} className="premium-button px-8 py-6 text-lg">
                <Plus className="h-5 w-5 mr-2" />
                Skapa din första offert
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={{
                  ...quote,
                  customer_name: getCustomerName(quote.customer_id)
                }}
                onEdit={() => handleOpenDialog(quote)}
                onDelete={() => handleDelete(quote.id)}
                onStatusChange={async (id, status) => {
                  try {
                    const { error } = await supabase
                      .from("quotes")
                      .update({ status })
                      .eq("id", id);

                    if (error) throw error;

                    fetchQuotes();
                    toast({
                      title: "Status uppdaterad",
                      description: `Offerten har markerats som ${status === 'sent' ? 'skickad' : status === 'accepted' ? 'accepterad' : status === 'rejected' ? 'avvisad' : 'utkast'}`,
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
              />
            ))}
          </div>
        )
      }
    </div >
  );
};

export default Quotes;
