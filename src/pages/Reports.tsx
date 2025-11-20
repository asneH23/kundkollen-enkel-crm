import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalCustomers: number;
  activeQuotes: number;
  wonDeals: number;
  totalValue: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
}

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    activeQuotes: 0,
    wonDeals: 0,
    totalValue: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch customers count
        const { count: customersCount } = await supabase
          .from("customers")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch active quotes (sent or draft)
        const { count: activeQuotesCount } = await supabase
          .from("quotes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("status", ["sent", "draft"]);

        // Fetch won deals
        const { count: wonDealsCount } = await supabase
          .from("quotes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "won");

        // Fetch total value of won deals
        const { data: wonQuotes } = await supabase
          .from("quotes")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "won");

        const totalValue = wonQuotes?.reduce((sum, quote) => sum + (quote.amount || 0), 0) || 0;

        setStats({
          totalCustomers: customersCount || 0,
          activeQuotes: activeQuotesCount || 0,
          wonDeals: wonDealsCount || 0,
          totalValue,
        });

        // Fetch recent activities
        const recentActivities: Activity[] = [];

        // Recent customers
        const { data: recentCustomers } = await supabase
          .from("customers")
          .select("company_name, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(2);

        recentCustomers?.forEach((customer) => {
          recentActivities.push({
            id: `customer-${customer.created_at}`,
            type: "customer",
            description: `Ny kund tillagd: ${customer.company_name}`,
            date: customer.created_at,
          });
        });

        // Recent won quotes
        const { data: recentWonQuotes } = await supabase
          .from("quotes")
          .select("title, amount, created_at")
          .eq("user_id", user.id)
          .eq("status", "won")
          .order("created_at", { ascending: false })
          .limit(2);

        recentWonQuotes?.forEach((quote) => {
          recentActivities.push({
            id: `quote-${quote.created_at}`,
            type: "quote",
            description: `Offert vunnen: ${quote.title} - ${quote.amount?.toLocaleString("sv-SE")} kr`,
            date: quote.created_at,
          });
        });

        // Recent reminders
        const { data: recentReminders } = await supabase
          .from("reminders")
          .select("title, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(2);

        recentReminders?.forEach((reminder) => {
          recentActivities.push({
            id: `reminder-${reminder.created_at}`,
            type: "reminder",
            description: `Påminnelse skapad: ${reminder.title}`,
            date: reminder.created_at,
          });
        });

        // Sort activities by date
        recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivities(recentActivities.slice(0, 5));

      } catch (error) {
        toast({
          title: "Fel",
          description: "Kunde inte hämta rapportdata",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, toast]);

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
          <h1 className="text-4xl font-bold mb-2">Enkla rapporter</h1>
          <p className="text-muted-foreground">Snabba insikter om din försäljning</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Totala kunder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.totalCustomers}</div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktiva offerter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.activeQuotes}</div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vunna affärer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.wonDeals}</div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Totalt värde</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {stats.totalValue >= 1000000 
                    ? `${(stats.totalValue / 1000000).toFixed(1)}M`
                    : `${Math.round(stats.totalValue / 1000)}k`}
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Senaste aktiviteter</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Inga aktiviteter ännu</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-center justify-between ${
                      index !== activities.length - 1 ? "pb-4 border-b" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString("sv-SE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
