import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatWidget from "@/components/StatWidget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Bell, TrendingUp, ArrowRight, Plus } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    quotes: 0,
    reminders: 0,
    wonQuotes: 0,
    totalValue: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [customersRes, quotesRes, remindersRes, wonQuotesRes, wonQuotesData] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reminders").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", false),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "accepted"),
        supabase.from("quotes").select("amount").eq("user_id", user.id).eq("status", "accepted"),
      ]);

      const totalValue = wonQuotesData.data?.reduce((sum, quote) => sum + (quote.amount || 0), 0) || 0;

      setStats({
        customers: customersRes.count || 0,
        quotes: quotesRes.count || 0,
        reminders: remindersRes.count || 0,
        wonQuotes: wonQuotesRes.count || 0,
        totalValue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const conversionRate = stats.quotes > 0 ? Math.round((stats.wonQuotes / stats.quotes) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-secondary">Välkommen tillbaka! Här är en översikt över din verksamhet.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget
          title="Kunder"
          value={stats.customers}
          icon={Building2}
          description="Totalt antal kunder"
          onClick={() => navigate("/kunder")}
        />
        <StatWidget
          title="Offerter"
          value={stats.quotes}
          icon={FileText}
          description="Totalt antal offerter"
          onClick={() => navigate("/offerter")}
        />
        <StatWidget
          title="Aktiva påminnelser"
          value={stats.reminders}
          icon={Bell}
          description="Påminnelser att följa upp"
          onClick={() => navigate("/paminnelser")}
        />
        <StatWidget
          title="Vunna affärer"
          value={stats.wonQuotes}
          icon={TrendingUp}
          description={`${conversionRate}% konvertering`}
          progress={conversionRate}
          onClick={() => navigate("/offerter")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-secondary">Försäljningsöversikt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-secondary">Total försäljning</span>
                  <span className="text-2xl font-bold text-primary">
                    {stats.totalValue.toLocaleString("sv-SE")} kr
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${Math.min((stats.totalValue / 1000000) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-secondary mb-1">Vunna affärer</p>
                  <p className="text-xl font-bold text-primary">{stats.wonQuotes}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-secondary mb-1">Genomsnitt</p>
                  <p className="text-xl font-bold text-primary">
                    {stats.wonQuotes > 0
                      ? Math.round(stats.totalValue / stats.wonQuotes).toLocaleString("sv-SE")
                      : 0}{" "}
                    kr
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-secondary">Snabblänkar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between text-primary border-border hover:bg-muted/50"
              onClick={() => navigate("/kunder")}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Hantera kunder
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between text-primary border-border hover:bg-muted/50"
              onClick={() => navigate("/offerter")}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Skapa offert
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between text-primary border-border hover:bg-muted/50"
              onClick={() => navigate("/paminnelser")}
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Lägg till påminnelse
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="pt-2 border-t border-border">
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate("/kunder")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Lägg till kund
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {stats.customers === 0 && stats.quotes === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                <Building2 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Kom igång med Kundkollen</h3>
              <p className="text-secondary mb-6">
                Börja med att lägga till din första kund för att få en fullständig översikt över din verksamhet.
              </p>
              <Button onClick={() => navigate("/kunder")}>
                <Plus className="h-4 w-4 mr-2" />
                Lägg till din första kund
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
