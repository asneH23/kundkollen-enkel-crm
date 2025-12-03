import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatWidget from "@/components/StatWidget";
import ActivityFeed from "@/components/ActivityFeed";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, FileText, Bell, TrendingUp, ArrowRight, Plus, Users, Sparkles } from "lucide-react";

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
  const [activities, setActivities] = useState<any[]>([]);
  const [salesGoal, setSalesGoal] = useState<number | null>(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const { toast } = useToast();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "God morgon";
    if (hour < 14) return "God dag";
    if (hour < 18) return "God eftermiddag";
    return "God kväll";
  };

  // Format number input with spaces (Swedish format: 100 000)
  const formatNumberInput = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Update goal input when dialog opens
  useEffect(() => {
    if (goalDialogOpen && salesGoal) {
      setGoalInput(salesGoal.toLocaleString("sv-SE"));
    } else if (goalDialogOpen && !salesGoal) {
      setGoalInput("");
    }
  }, [goalDialogOpen, salesGoal]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchSalesGoal();
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

      // Fetch recent activities
      const recentActivities: any[] = [];

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
          title: "Ny kund tillagd",
          description: customer.company_name,
          timestamp: customer.created_at,
          icon: Users,
          color: "bg-accent/10 border border-accent/20 text-accent",
        });
      });

      // Recent accepted quotes
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
          title: "Offert accepterad",
          description: `${quote.title} - ${quote.amount?.toLocaleString("sv-SE")} kr`,
          timestamp: quote.created_at,
          icon: TrendingUp,
          color: "bg-accent/10 border border-accent/20 text-accent",
        });
      });

      // Recent sent quotes
      const { data: recentSentQuotes } = await supabase
        .from("quotes")
        .select("title, created_at")
        .eq("user_id", user.id)
        .eq("status", "sent")
        .order("created_at", { ascending: false })
        .limit(2);

      recentSentQuotes?.forEach((quote) => {
        recentActivities.push({
          id: `quote-sent-${quote.created_at}`,
          type: "quote",
          title: "Offert skickad",
          description: quote.title,
          timestamp: quote.created_at,
          icon: FileText,
          color: "bg-blue-500/10 border border-blue-500/20 text-blue-400",
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
          title: "Påminnelse skapad",
          description: reminder.title,
          timestamp: reminder.created_at,
          icon: Bell,
          color: "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400",
        });
      });

      // Sort by timestamp and limit to 5
      recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(recentActivities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchSalesGoal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("sales_goal")
        .eq("id", user.id)
        .single();

      if (!error && data?.sales_goal) {
        setSalesGoal(data.sales_goal);
        localStorage.setItem(`sales_goal_${user.id}`, data.sales_goal.toString());
        return;
      }
    } catch (error) {
      // Column might not exist
    }

    const savedGoal = localStorage.getItem(`sales_goal_${user.id}`);
    if (savedGoal) {
      setSalesGoal(parseFloat(savedGoal));
    }
  };

  const handleSaveGoal = async () => {
    if (!user) return;
    const goalValue = parseFloat(goalInput.replace(/\s/g, "").replace(",", "."));

    if (isNaN(goalValue) || goalValue <= 0) {
      toast({
        title: "Ogiltigt värde",
        description: "Ange ett giltigt försäljningsmål",
        variant: "destructive",
      });
      return;
    }

    try {
      if (user) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ sales_goal: goalValue })
            .eq("id", user.id);

          if (!error) {
            setSalesGoal(goalValue);
            localStorage.setItem(`sales_goal_${user.id}`, goalValue.toString());
            setGoalDialogOpen(false);
            setGoalInput("");

            toast({
              title: "Mål sparat",
              description: "Ditt försäljningsmål har uppdaterats",
            });
            return;
          }
        } catch (dbError: any) {
          if (dbError.code !== '42703' && !dbError.message?.includes('column')) {
            throw dbError;
          }
        }
      }

      if (user) {
        localStorage.setItem(`sales_goal_${user.id}`, goalValue.toString());
        setSalesGoal(goalValue);
        setGoalDialogOpen(false);
        setGoalInput("");

        toast({
          title: "Mål sparat",
          description: "Ditt försäljningsmål har sparats lokalt",
        });
      }
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte spara mål",
        variant: "destructive",
      });
    }
  };

  const conversionRate = stats.quotes > 0 ? Math.round((stats.wonQuotes / stats.quotes) * 100) : 0;
  const goalProgress = salesGoal && salesGoal > 0 ? Math.min((stats.totalValue / salesGoal) * 100, 100) : 0;

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-2 tracking-tight">
            {getGreeting()}, <span className="text-accent">Aston</span>
          </h1>
          <p className="text-secondary-foreground/60 text-lg">Här är en översikt över din verksamhet idag.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/offerter")} className="premium-button">
            <Plus className="h-4 w-4 mr-2" />
            Ny Offert
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatWidget
          title="Kunder"
          value={stats.customers}
          icon={Users}
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
          title="Påminnelser"
          value={stats.reminders}
          icon={Bell}
          description="Att följa upp"
          onClick={() => navigate("/paminnelser")}
        />
        <StatWidget
          title="Konvertering"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          description="Accepterade offerter"
          progress={conversionRate}
          onClick={() => navigate("/offerter")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="h-24 w-24 text-accent" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">Försäljningsöversikt</h2>
              <p className="text-sm text-secondary-foreground/60">Din försäljning mot målet</p>
            </div>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/5 border-black/10 hover:bg-black/10 text-primary"
                >
                  {salesGoal ? "Ändra mål" : "Sätt mål"}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-black/10 text-primary">
                <DialogHeader>
                  <DialogTitle>Sätt försäljningsmål</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="goal" className="text-base font-medium text-primary">
                      Försäljningsmål (kr)
                    </Label>
                    <Input
                      id="goal"
                      type="text"
                      value={goalInput}
                      onChange={(e) => {
                        const formatted = formatNumberInput(e.target.value);
                        setGoalInput(formatted);
                      }}
                      placeholder={salesGoal ? salesGoal.toLocaleString("sv-SE") : "1 000 000"}
                      className="premium-input mt-2 text-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveGoal} className="premium-button flex-1">
                      Spara mål
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-8 relative z-10">
            <div>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">
                  {stats.totalValue.toLocaleString("sv-SE")} <span className="text-2xl text-secondary-foreground/40 font-normal">kr</span>
                </span>
              </div>

              {salesGoal ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-secondary-foreground/60">Framsteg mot {salesGoal.toLocaleString("sv-SE")} kr</span>
                    <span className="text-accent font-medium">{goalProgress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent shadow-[0_0_10px_rgba(22,163,74,0.5)] transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-black/5 border border-black/10 border-dashed text-center">
                  <p className="text-sm text-secondary-foreground/60">Inget mål satt än</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-black/5 border border-black/5">
                <p className="text-xs text-secondary-foreground/60 mb-1 uppercase tracking-wider">Accepterade affärer</p>
                <p className="text-2xl font-bold text-primary">{stats.wonQuotes}</p>
              </div>
              <div className="p-4 rounded-lg bg-black/5 border border-black/5">
                <p className="text-xs text-secondary-foreground/60 mb-1 uppercase tracking-wider">Snittvärde</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.wonQuotes > 0
                    ? Math.round(stats.totalValue / stats.wonQuotes).toLocaleString("sv-SE")
                    : 0} kr
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Snabblänkar
            </h3>
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-between text-primary hover:bg-black/5 hover:text-accent group h-12"
                onClick={() => navigate("/kunder")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-black/5 group-hover:bg-accent/10 transition-colors">
                    <Users className="h-4 w-4" />
                  </div>
                  <span>Hantera kunder</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between text-primary hover:bg-black/5 hover:text-accent group h-12"
                onClick={() => navigate("/offerter")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-black/5 group-hover:bg-accent/10 transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span>Skapa offert</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between text-primary hover:bg-black/5 hover:text-accent group h-12"
                onClick={() => navigate("/paminnelser")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-black/5 group-hover:bg-accent/10 transition-colors">
                    <Bell className="h-4 w-4" />
                  </div>
                  <span>Lägg till påminnelse</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>

          {/* Activity Feed Mini */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Senaste händelser</h3>
            <ActivityFeed activities={activities.slice(0, 3)} />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {stats.customers === 0 && stats.quotes === 0 && (
        <div className="glass-card rounded-xl p-12 text-center border-dashed border-black/10">
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20 shadow-glow">
            <Building2 className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-3">Välkommen till framtiden</h3>
          <p className="text-secondary-foreground/60 mb-8 max-w-md mx-auto">
            Ditt nya CRM är redo. Börja med att lägga till din första kund för att se magin hända.
          </p>
          <Button onClick={() => navigate("/kunder")} className="premium-button px-8 py-6 text-lg">
            <Plus className="h-5 w-5 mr-2" />
            Lägg till kund
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
