import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
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

const Quotes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("draft");

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
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte hämta offerter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [user]);

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;

    try {
      const { error } = await supabase.from("quotes").insert({
        user_id: user.id,
        title,
        amount: amount ? parseFloat(amount) : null,
        status,
      });

      if (error) throw error;

      toast({
        title: "Framgång",
        description: "Offert skapad",
      });

      setTitle("");
      setAmount("");
      setStatus("draft");
      setOpen(false);
      fetchQuotes();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skapa offert",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("quotes").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Framgång",
        description: "Offert borttagen",
      });

      fetchQuotes();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort offert",
        variant: "destructive",
      });
    }
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
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Skapa ny offert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Skapa ny offert</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddQuote} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="T.ex. Webbprojekt för Acme AB"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Belopp (kr)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="125000"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
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
                <Button type="submit" className="w-full">
                  Skapa offert
                </Button>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{quote.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Skapad: {new Date(quote.created_at).toLocaleDateString("sv-SE")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {quote.amount && (
                          <p className="font-bold text-xl mb-2">
                            {quote.amount.toLocaleString("sv-SE")} kr
                          </p>
                        )}
                        <Badge variant={getStatusVariant(quote.status)}>
                          {getStatusLabel(quote.status)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(quote.id)}
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
