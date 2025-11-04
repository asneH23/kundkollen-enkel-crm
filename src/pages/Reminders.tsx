import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Clock } from "lucide-react";

const Reminders = () => {
  const navigate = useNavigate();
  const reminders = [
    { id: 1, customer: "Acme AB", action: "Följ upp offert", date: "2025-01-25", priority: "Hög" },
    { id: 2, customer: "Tech Solutions", action: "Kvartalsuppföljning", date: "2025-01-28", priority: "Medel" },
    { id: 3, customer: "Nordic AB", action: "Ring ang. nytt projekt", date: "2025-02-01", priority: "Låg" },
  ];

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "Hög": return "destructive";
      case "Medel": return "default";
      case "Låg": return "secondary";
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
          <h1 className="text-4xl font-bold mb-2">Påminnelser om uppföljning</h1>
          <p className="text-muted-foreground">Missa aldrig en viktig uppföljning</p>
        </div>

        <div className="mb-6">
          <Button>
            <Bell className="mr-2 h-4 w-4" />
            Skapa påminnelse
          </Button>
        </div>

        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[hsl(var(--feature-icon-bg))] flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[hsl(var(--feature-icon-fg))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{reminder.customer}</h3>
                      <p className="text-muted-foreground mb-2">{reminder.action}</p>
                      <p className="text-sm text-muted-foreground">Datum: {reminder.date}</p>
                    </div>
                  </div>
                  <Badge variant={getPriorityVariant(reminder.priority)}>{reminder.priority}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Reminders;
