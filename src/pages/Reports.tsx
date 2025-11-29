import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const { user } = useAuth();
  const navigate = useNavigate();
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
          .eq("status", "accepted");

        // Fetch total value of won deals
        const { data: wonQuotes } = await supabase
          .from("quotes")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "accepted");

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
          .eq("status", "accepted")
          .order("created_at", { ascending: false })
          .limit(2);

        recentWonQuotes?.forEach((quote) => {
          recentActivities.push({
            id: `quote-${quote.created_at}`,
            type: "quote",
            description: `Offert accepterad: ${quote.title} - ${quote.amount?.toLocaleString("sv-SE")} kr`,
            date: quote.created_at,
          });
        });

        // Recent sent quotes
        const { data: recentSentQuotes } = await supabase
          .from("quotes")
          .select("title, amount, created_at")
          .eq("user_id", user.id)
          .eq("status", "sent")
          .order("created_at", { ascending: false })
          .limit(3);

        recentSentQuotes?.forEach((quote) => {
          recentActivities.push({
            id: `quote-sent-${quote.created_at}`,
            type: "quote_sent",
            description: `Offert skickad: ${quote.title} - ${quote.amount?.toLocaleString("sv-SE")} kr`,
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-primary">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Rapporter</h1>
        <p className="text-sm sm:text-base text-secondary">Snabba insikter baserade på dina offerter och accepterade affärer</p>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-secondary">Totala kunder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold text-primary">{stats.totalCustomers}</div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-secondary">Aktiva offerter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold text-primary">{stats.activeQuotes}</div>
                <FileText className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-secondary">Accepterade offerter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold text-primary">{stats.wonDeals}</div>
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-secondary">Värde accepterade offerter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold text-primary">
                  {stats.totalValue >= 1000000 
                    ? `${(stats.totalValue / 1000000).toFixed(1)}M`
                    : `${Math.round(stats.totalValue / 1000)}k`}
                </div>
                <BarChart3 className="h-8 w-8 text-accent" />
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
    </div>
  );
};

export default Reports;
