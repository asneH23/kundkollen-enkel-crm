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
import { Building2, FileText, Bell, TrendingUp, ArrowRight, Plus, Edit2, Users } from "lucide-react";

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
          color: "bg-accent/10 border border-accent/20",
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
          color: "bg-accent/10 border border-accent/20",
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
          color: "bg-blue-500/10 border border-blue-500/20",
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
          color: "bg-yellow-500/10 border border-yellow-500/20",
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
    
    // Try to fetch from database first (if column exists)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("sales_goal")
        .eq("id", user.id)
        .single();

      if (!error && data?.sales_goal) {
        setSalesGoal(data.sales_goal);
        // Also save to localStorage as backup
        localStorage.setItem(`sales_goal_${user.id}`, data.sales_goal.toString());
        return;
      }
    } catch (error) {
      // Column might not exist, that's okay
    }

    // Fallback to localStorage if database doesn't have it
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
      // Try to save to database first (if column exists)
      if (user) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ sales_goal: goalValue })
            .eq("id", user.id);

          if (!error) {
            // Successfully saved to database
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
          // Column might not exist, that's okay - we'll use localStorage
          if (dbError.code !== '42703' && !dbError.message?.includes('column')) {
            throw dbError;
          }
        }
      }

      // Fallback: Save to localStorage (works without database changes)
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-secondary">Välkommen tillbaka! Här är en översikt över din verksamhet.</p>
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
          title={
            <>
              Aktiva<br />
              Påminnelser
            </>
          }
          value={stats.reminders}
          icon={Bell}
          description="Påminnelser att följa upp"
          onClick={() => navigate("/paminnelser")}
        />
        <StatWidget
          title="Accepterade affärer"
          value={stats.wonQuotes}
          icon={TrendingUp}
          description={`${conversionRate}% konvertering`}
          progress={conversionRate}
          onClick={() => navigate("/offerter")}
        />
        </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Card */}
        <Card className="lg:col-span-2 border-accent/10">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-lg font-semibold text-secondary">Försäljningsöversikt</CardTitle>
              <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant={salesGoal ? "outline" : "default"} 
                    size="sm" 
                    className="flex items-center gap-2"
                  >
                    {salesGoal ? "Ändra mål" : "Sätt försäljningsmål"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sätt försäljningsmål</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
            <div>
                      <Label htmlFor="goal" className="text-base font-medium">
                        Försäljningsmål (kr)
                      </Label>
                      <Input
                        id="goal"
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder={salesGoal ? salesGoal.toLocaleString("sv-SE") : "1000000"}
                        className="mt-2 text-lg"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Ange ditt mål för total försäljning. Du kan alltid ändra detta senare.
                      </p>
                      {salesGoal && (
                        <p className="text-xs text-secondary mt-1">
                          Nuvarande mål: {salesGoal.toLocaleString("sv-SE")} kr
                        </p>
                      )}
              </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveGoal} className="flex-1">
                        Spara mål
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setGoalDialogOpen(false);
                          setGoalInput("");
                        }}
                      >
                        Avbryt
                      </Button>
            </div>
              </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm text-secondary block mb-1">Total försäljning</span>
                    <span className="text-3xl font-bold text-primary">
                      {stats.totalValue.toLocaleString("sv-SE")} kr
                    </span>
                  </div>
                  {salesGoal && (
                    <div className="text-right">
                      <span className="text-sm text-secondary block mb-1">Mål</span>
                      <span className="text-xl font-semibold text-primary">
                        {salesGoal.toLocaleString("sv-SE")} kr
                      </span>
                    </div>
                  )}
                </div>
                {salesGoal ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-500 rounded-full"
                        style={{ width: `${goalProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-secondary">
                        {goalProgress.toFixed(1)}% av målet
                      </span>
                      <span className="text-secondary">
                        {((salesGoal - stats.totalValue) > 0 
                          ? (salesGoal - stats.totalValue).toLocaleString("sv-SE")
                          : "Mål uppnått!")} kr kvar
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded bg-muted/30 border border-dashed border-accent/30">
                    <div className="text-sm text-secondary mb-2">
                      <span className="font-medium">Inget försäljningsmål satt</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Sätt ett försäljningsmål för att spåra din framsteg och se hur nära du är ditt mål.
                    </p>
                    <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="default" size="sm" className="w-full sm:w-auto">
                          Sätt försäljningsmål
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded bg-muted/50 border border-border hover:border-accent/30 transition-colors">
                  <p className="text-xs text-secondary mb-1">Accepterade affärer</p>
                  <p className="text-xl font-bold text-primary">{stats.wonQuotes}</p>
                </div>
                <div className="p-4 rounded bg-muted/50 border border-border hover:border-accent/30 transition-colors">
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
        <Card className="border-border">
            <CardHeader>
            <CardTitle className="text-lg font-semibold text-secondary flex items-center gap-2">
              <Plus className="h-5 w-5 text-accent" />
              Snabblänkar
            </CardTitle>
            </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between text-primary border-border hover:bg-muted/50"
              onClick={() => navigate("/kunder")}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
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

      {/* Activity Feed */}
      <div>
        <ActivityFeed activities={activities} />
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
