import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "react-router-dom";
import { FileText, Trash2, Pencil } from "lucide-react";
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
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
      case "accepted": return "Vunnen";
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-lg">Laddar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Offert- och säljöversikt</h1>
          <p className="text-muted-foreground">Följ upp dina offerter och affärer</p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Sök på titel eller kund"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtera status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla statusar</SelectItem>
                <SelectItem value="draft">Utkast</SelectItem>
                <SelectItem value="sent">Skickad</SelectItem>
                <SelectItem value="accepted">Vunnen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
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
                      <SelectItem value="accepted">Vunnen</SelectItem>
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

        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {quotes.length === 0
                ? "Inga offerter ännu. Skapa din första offert!"
                : "Inga offerter matchar dina filter."}
            </CardContent>
          </Card>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Belopp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skapad</TableHead>
                  <TableHead className="w-[80px] text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow
                    key={quote.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedQuote(quote);
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">{quote.title}</TableCell>
                    <TableCell>{getCustomerName(quote.customer_id)}</TableCell>
                    <TableCell>
                      {quote.amount ? `${quote.amount.toLocaleString("sv-SE")} kr` : "Inget belopp"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(quote.status)}>
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(quote.created_at).toLocaleDateString("sv-SE")}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Klicka på en rad för att se mer information om offerten.</TableCaption>
            </Table>

            <Sheet
              open={detailOpen}
              onOpenChange={(open) => {
                setDetailOpen(open);
                if (!open) {
                  setSelectedQuote(null);
                }
              }}
            >
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </span>
                    {selectedQuote?.title || "Offertdetaljer"}
                  </SheetTitle>
                </SheetHeader>
                {selectedQuote && (
                  <div className="mt-6 space-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Kund</p>
                      <p className="font-medium">
                        {getCustomerName(selectedQuote.customer_id)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Belopp</p>
                      <p className="font-medium">
                        {selectedQuote.amount
                          ? `${selectedQuote.amount.toLocaleString("sv-SE")} kr`
                          : "Inget belopp angivet"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={getStatusVariant(selectedQuote.status)}>
                        {getStatusLabel(selectedQuote.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Skapad</p>
                      <p className="font-medium">
                        {new Date(selectedQuote.created_at).toLocaleString("sv-SE")}
                      </p>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setDetailOpen(false);
                          handleOpenDialog(selectedQuote);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Redigera
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDetailOpen(false);
                          handleDelete(selectedQuote.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Ta bort
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </>
        )}
      </main>
    </div>
  );
};

export default Quotes;
