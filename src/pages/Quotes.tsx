import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Trash2, Pencil } from "lucide-react";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formData, setFormData] = useState<QuoteFormData>({
    title: "",
    amount: "",
    status: "draft",
    customerId: "",
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
        customerId: quote.customer_id || "",
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
        customer_id: formData.customerId || null,
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
      case "won": return "default";
      case "sent": return "secondary";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "won": return "Vunnen";
      case "sent": return "Skickad";
      case "draft": return "Utkast";
      default: return "Okänd";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="font-bold text-xl text-primary">
              Kundkollen
            </div>
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Offert- och säljöversikt</h1>
          <p className="text-muted-foreground">Följ upp dina offerter och affärer</p>
        </div>

        <div className="mb-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <FileText className="mr-2 h-4 w-4" />
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
                      <SelectItem value="">Ingen kund</SelectItem>
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
                      <SelectItem value="won">Vunnen</SelectItem>
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

        {quotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Inga offerter ännu. Skapa din första offert!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quotes.map((quote) => (
              <Card key={quote.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{quote.title}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          Kund: {getCustomerName(quote.customer_id)}
                        </p>
                        <p className="text-muted-foreground mb-2">
                          {quote.amount ? `${quote.amount.toLocaleString("sv-SE")} kr` : "Inget belopp"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Skapad: {new Date(quote.created_at).toLocaleDateString("sv-SE")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(quote.status)}>
                        {getStatusLabel(quote.status)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(quote)}
                        title="Redigera"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(quote.id)}
                        title="Ta bort"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Quotes;
