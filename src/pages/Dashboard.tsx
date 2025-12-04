import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatWidget from "@/components/StatWidget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Bell, TrendingUp, Users, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
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
  const [displayName, setDisplayName] = useState<string>("");
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
      fetchDisplayName();
      fetchStats();
      fetchSalesGoal();
    }
  }, [user]);

  // Listen for storage changes and focus events to update display name immediately
  useEffect(() => {
    if (!user) return;

    const checkAndUpdateName = () => {
      const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
      if (storedName && storedName !== displayName) {
        setDisplayName(storedName);
      }
    };

    // Check on window focus (when user comes back to tab)
    const handleFocus = () => {
      checkAndUpdateName();
    };

    // Listen for custom event when name is saved
    const handleNameSaved = () => {
      checkAndUpdateName();
    };

    // Listen for storage events (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `profile_display_name_${user.id}` && e.newValue) {
        setDisplayName(e.newValue);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('displayNameUpdated', handleNameSaved);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('displayNameUpdated', handleNameSaved);
    };
  }, [user, displayName]);

  const fetchDisplayName = async () => {
    if (!user) return;

    // Check localStorage first for immediate update (faster)
    const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
    if (storedName) {
      setDisplayName(storedName);
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (error && error.code === "42703") {
        console.log("display_name column not yet created in database");
        return;
      }

      if (error && error.code !== "PGRST116") throw error;

      // Update from database if it exists (overrides localStorage if different)
      if (data && 'display_name' in data && data.display_name) {
        setDisplayName(data.display_name as string);
        // Sync to localStorage
        localStorage.setItem(`profile_display_name_${user.id}`, data.display_name);
      } else if (!storedName) {
        // Only check localStorage if database has no value and we haven't set it yet
        const localName = localStorage.getItem(`profile_display_name_${user.id}`);
        if (localName) {
          setDisplayName(localName);
        }
      }
    } catch (error) {
      console.error("Error fetching display name:", error);
    }
  };

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
    <div className="space-y-8 animate-enter pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4 lg:mt-0">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight mb-2">
            {getGreeting()}{displayName && <>, <span className="text-accent">{displayName}</span></>}
          </h1>
          <p className="text-primary/70 text-lg">
            Här är din översikt för idag.
          </p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Main Stats - Row 1 */}
        <div className="lg:col-span-2">
          <StatWidget
            title="Total Försäljning"
            value={`${stats.totalValue.toLocaleString()} kr`}
            icon={TrendingUp}
            description="Totalt värde av accepterade offerter"
            trend="up"
            className="h-full bg-primary text-white"
            iconClassName="text-accent"
          />
        </div>
        <div className="lg:col-span-2">
          <StatWidget
            title="Aktiva Kunder"
            value={stats.customers}
            icon={Users}
            description="Totalt antal kunder"
            onClick={() => navigate("/kunder")}
          />
        </div>

        {/* Secondary Stats & Goal - Row 2 */}
        <div className="lg:col-span-1">
          <StatWidget
            title="Skickade Offerter"
            value={stats.quotes}
            icon={FileText}
            description="Totalt antal offerter"
            onClick={() => navigate("/offerter")}
          />
        </div>
        <div className="lg:col-span-1">
          <StatWidget
            title="Påminnelser"
            value={stats.reminders}
            icon={Bell}
            description="Att hantera"
            onClick={() => navigate("/paminnelser")}
          />
        </div>

        {/* Sales Goal Card - Spans 2 columns */}
        <div className="lg:col-span-2 bg-accent text-white p-8 relative overflow-hidden group cursor-pointer rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setGoalDialogOpen(true)}>


          <div className="relative z-10">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-medium text-white/90">Månadsmål</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-white/70 hover:text-white cursor-help transition-colors hidden lg:block" />
                    </TooltipTrigger>
                    <TooltipContent 
                      className="bg-white border border-black/10 text-primary max-w-xs p-3 rounded-xl shadow-lg"
                    >
                      <p className="text-sm">
                        Sätt ett månadsvis försäljningsmål för att följa hur din verksamhet går.
                        Du kan ändra målet när som helst genom att klicka på kortet.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-white/80 lg:hidden mb-2">
                Klicka för att sätta eller ändra ditt månadsvis försäljningsmål.
              </p>
              <div className="text-4xl font-bold text-white tracking-tight">
                {salesGoal ? `${Math.round((stats.totalValue / salesGoal) * 100)}%` : "0%"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-white/90">{stats.totalValue.toLocaleString()} kr</span>
                <span className="text-white">{salesGoal?.toLocaleString() || "0"} kr</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${salesGoal ? Math.min((stats.totalValue / salesGoal) * 100, 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-white/80 mt-2">Klicka för att ändra mål</p>
            </div>
          </div>
        </div>

        {/* Activity Feed - Row 3 (Full Width) */}
        <div className="lg:col-span-4">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:border-accent/30 transition-all duration-300">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-primary">Senaste Händelser</h3>
            </div>

            <div className="space-y-6">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-primary/60">Inga aktiviteter ännu</div>
              ) : (
                activities.map((activity) => {
                  const activityDescription = activity.title && activity.description 
                    ? `${activity.title}: ${activity.description}`
                    : activity.description || activity.title || "";
                  
                  return (
                    <div key={activity.id} className="flex gap-4 group">
                      <div className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <div>
                        <p className="text-primary font-medium">{activityDescription}</p>
                        <p className="text-sm text-primary/60 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString("sv-SE", {
                            month: "short",
                            day: "numeric",
                          })} • {new Date(activity.timestamp).toLocaleTimeString("sv-SE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="bg-white border border-black/10 text-primary sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Sätt försäljningsmål</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="goal" className="text-sm font-medium text-primary/80">Månadsmål (kr)</Label>
              <Input
                id="goal"
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(formatNumberInput(e.target.value))}
                placeholder="T.ex. 100 000"
                className="premium-input text-lg h-12"
              />
            </div>
            <Button onClick={handleSaveGoal} className="premium-button w-full">
              Spara mål
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
