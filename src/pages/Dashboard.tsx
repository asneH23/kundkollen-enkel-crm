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
import { FileText, Bell, TrendingUp, Users, HelpCircle, Calendar as CalendarIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import WeekCalendar, { CalendarEvent } from "@/components/WeekCalendar";
import { addDays } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({
    customers: 0,
    quotes: 0,
    reminders: 0,
    paidInvoices: 0,
    totalValue: 0,
  });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
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
      fetchCalendarEvents();
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

    try {
      // Always prioritize database first - it's the source of truth across devices
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (error && error.code === "42703") {

        // If column doesn't exist, check localStorage as fallback
        const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
        if (storedName) {
          setDisplayName(storedName);
        }
        return;
      }

      if (error && error.code !== "PGRST116") throw error;

      // Update from database if it exists (this is the source of truth)
      if (data && 'display_name' in data && data.display_name) {
        const dbName = data.display_name as string;
        setDisplayName(dbName);
        // Sync to localStorage for faster access next time
        localStorage.setItem(`profile_display_name_${user.id}`, dbName);
      } else {
        // Database has no value, clear any localStorage value to avoid stale data
        const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
        if (storedName) {
          // Use localStorage as temporary fallback, but prefer empty if it seems stale
          setDisplayName(storedName);
        } else {
          setDisplayName("");
        }
      }
    } catch (error) {
      console.error("Error fetching display name:", error);
      // On error, try localStorage as last resort
      const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
      if (storedName) {
        setDisplayName(storedName);
      }
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [customersRes, quotesRes, remindersRes, paidInvoicesRes, paidInvoicesData] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reminders").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", false),
        supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "paid"),
        supabase.from("invoices").select("amount").eq("user_id", user.id).eq("status", "paid"),
      ]);

      const totalValue = paidInvoicesData.data?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;

      setStats({
        customers: customersRes.count || 0,
        quotes: quotesRes.count || 0,
        reminders: remindersRes.count || 0,
        paidInvoices: paidInvoicesRes.count || 0,
        totalValue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchCalendarEvents = async () => {
    if (!user) return;

    try {
      const events: CalendarEvent[] = [];

      // 1. Fetch Reminders (Due Dates)
      const { data: reminders } = await supabase
        .from("reminders")
        .select("id, title, description, due_date")
        .eq("user_id", user.id)
        .eq("completed", false);

      reminders?.forEach(reminder => {
        events.push({
          id: `reminder-${reminder.id}`,
          type: "reminder",
          title: "Påminnelse",
          description: reminder.title,
          date: new Date(reminder.due_date),
        });
      });

      // 2. Fetch Invoices (Due Dates)
      const { data: invoices } = await supabase
        .from("invoices" as any)
        .select("id, invoice_number, customer_name, amount, due_date, status")
        .eq("user_id", user.id)
        .neq("status", "paid")
        .neq("status", "cancelled");

      invoices?.forEach((invoice: any) => {
        events.push({
          id: `invoice-${invoice.id}`,
          type: "invoice",
          title: `Faktura #${invoice.invoice_number}`,
          description: `${(invoice as any).customer_name || 'Okänd kund'}`,
          date: new Date(invoice.due_date),
          amount: invoice.amount,
          status: invoice.status
        });
      });

      // 3. Fetch Quotes (Expiration = Created + 30 days)
      const { data: quotes } = await supabase
        .from("quotes")
        .select("id, title, created_at, amount, status")
        .eq("user_id", user.id)
        .eq("status", "sent");

      quotes?.forEach(quote => {
        // Calculate expiration date
        const createdDate = new Date(quote.created_at);
        const expirationDate = addDays(createdDate, 30);

        // Only show if it's in the future (or recent past?) - WeekCalendar logic filters by week view mostly
        events.push({
          id: `quote-${quote.id}`,
          type: "quote",
          title: "Offert går ut",
          description: quote.title,
          date: expirationDate,
          amount: quote.amount || undefined,
          status: quote.status || undefined
        });
      });

      setCalendarEvents(events);

    } catch (error) {
      console.error("Error fetching calendar events:", error);
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

  // const conversionRate = stats.quotes > 0 ? Math.round((stats.wonQuotes / stats.quotes) * 100) : 0; // Not currently used
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Main Stats - Row 1 */}
        <div className="lg:col-span-2">
          <StatWidget
            title="Total Försäljning"
            value={`${stats.totalValue.toLocaleString()} kr`}
            icon={TrendingUp}
            description="Totalt värde av betalda fakturor"
            trend="up"
            className="h-full bg-primary text-white hover:bg-primary"
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

        {/* Weekly Calendar Widget (Replaces Activity Feed) */}
        <div className="lg:col-span-4">
          <WeekCalendar events={calendarEvents} />
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
