import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Bell, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    quotes: 0,
    reminders: 0,
    wonQuotes: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [customersRes, quotesRes, remindersRes, wonQuotesRes] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reminders").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", false),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "won"),
      ]);

      setStats({
        customers: customersRes.count || 0,
        quotes: quotesRes.count || 0,
        reminders: remindersRes.count || 0,
        wonQuotes: wonQuotesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    {
      title: "Kunder",
      value: stats.customers,
      icon: Building2,
      link: "/kunder",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Offerter",
      value: stats.quotes,
      icon: FileText,
      link: "/offerter",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Aktiva påminnelser",
      value: stats.reminders,
      icon: Bell,
      link: "/paminnelser",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Vunna affärer",
      value: stats.wonQuotes,
      icon: TrendingUp,
      link: "/offerter",
      color: "bg-green-500/10 text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Välkommen tillbaka! Här är en översikt över din verksamhet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <Card key={card.title} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(card.link)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Snabblänkar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/kunder")}>
                <Building2 className="mr-2 h-4 w-4" />
                Hantera kunder
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/offerter")}>
                <FileText className="mr-2 h-4 w-4" />
                Skapa offert
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/paminnelser")}>
                <Bell className="mr-2 h-4 w-4" />
                Lägg till påminnelse
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Senaste aktivitet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.customers === 0 && stats.quotes === 0 && stats.reminders === 0
                  ? "Börja med att lägga till din första kund!"
                  : "Använd snabblänkarna för att hantera dina kunder, offerter och påminnelser."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
