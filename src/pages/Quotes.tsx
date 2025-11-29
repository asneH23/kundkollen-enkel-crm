import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuoteCard from "@/components/QuoteCard";
import { useSearchParams } from "react-router-dom";
import { FileText, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Quote {
  id: string;
  title: string;
  amount: number | null;
  status: string | null;
  customer_id: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  company_name: string;
}

interface QuoteFormData {
  title: string;
  amount: string;
  status: string;
  customerId: string;
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
  const [formData, setFormData] = useState<QuoteFormData>({
    title: "",
    amount: "",
    status: "draft",
    customerId: "none",
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
        .select("id, company_name")
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
  }, [user]);

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      status: "draft",
      customerId: "",
    });
    setEditingQuote(null);
  };

  const handleOpenDialog = (quote?: Quote) => {
    if (quote) {
      setEditingQuote(quote);
      setFormData({
        title: quote.title,
        amount: quote.amount?.toString() || "",
        status: quote.status || "draft",
        customerId: quote.customer_id || "none",
      });
    } else {
      resetForm();
    }
    setOpen(true);
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
      const quoteData = {
        title: formData.title.trim(),
        amount: formData.amount ? parseFloat(formData.amount) : null,
        status: formData.status,
        customer_id: formData.customerId === "none" ? null : formData.customerId,
      };

      if (editingQuote) {
        const { error } = await supabase
          .from("quotes")
          .update(quoteData)
          .eq("id", editingQuote.id);

        if (error) throw error;

        toast({
          title: "Uppdaterad",
          description: "Offerten har uppdaterats",
        });
      } else {
        const { error } = await supabase.from("quotes").insert({
          user_id: user.id,
          ...quoteData,
        });

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Offerter</h1>
          <p className="text-sm sm:text-base text-secondary">Följ upp dina offerter och affärer</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
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
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="50000"
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
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingQuote ? "Uppdatera" : "Skapa"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Avbryt
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
          <Input
            placeholder="Sök på titel eller kund"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
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
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                <FileText className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {quotes.length === 0 ? "Inga offerter ännu" : "Inga offerter matchar dina filter"}
              </h3>
              <p className="text-secondary mb-6">
                {quotes.length === 0
                  ? "Börja med att skapa din första offert för att komma igång."
                  : "Prova att ändra dina filter för att hitta fler resultat."}
              </p>
              {quotes.length === 0 && (
                <Button onClick={() => handleOpenDialog()}>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Quotes;
