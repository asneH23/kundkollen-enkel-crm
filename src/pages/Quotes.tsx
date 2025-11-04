import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

const Quotes = () => {
  const navigate = useNavigate();
  const quotes = [
    { id: 1, customer: "Acme AB", amount: "125 000 kr", status: "Skickad", date: "2025-01-15" },
    { id: 2, customer: "Tech Solutions", amount: "85 000 kr", status: "Vunnen", date: "2025-01-10" },
    { id: 3, customer: "Nordic AB", amount: "250 000 kr", status: "Pågående", date: "2025-01-20" },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Vunnen": return "default";
      case "Skickad": return "secondary";
      case "Pågående": return "outline";
      default: return "secondary";
    }
  };

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
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Skapa ny offert
          </Button>
        </div>

        <div className="grid gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{quote.customer}</h3>
                    <p className="text-sm text-muted-foreground">Datum: {quote.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl mb-2">{quote.amount}</p>
                    <Badge variant={getStatusVariant(quote.status)}>{quote.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Quotes;
