import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, FileText, Bell, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface UpcomingReminder {
  id: string;
  title: string;
  due_date: string;
  customer_id: string | null;
  customerName?: string | null;
  daysUntil: number;
  isOverdue: boolean;
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
  const [upcomingReminders, setUpcomingReminders] = useState<UpcomingReminder[]>([]);
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

        // Fetch upcoming reminders
        const { data: reminders } = await supabase
          .from("reminders")
          .select("id, title, due_date, customer_id")
          .eq("user_id", user.id)
          .eq("completed", false)
          .order("due_date", { ascending: true });

        // Fetch customers for matching
        const { data: allCustomers } = await supabase
          .from("customers")
          .select("id, company_name")
          .eq("user_id", user.id);

        if (reminders) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const upcoming: UpcomingReminder[] = reminders
            .map((reminder) => {
              const dueDate = new Date(reminder.due_date);
              dueDate.setHours(0, 0, 0, 0);
              const diffTime = dueDate.getTime() - today.getTime();
              const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const customer = allCustomers?.find(c => c.id === reminder.customer_id);

              return {
                id: reminder.id,
                title: reminder.title,
                due_date: reminder.due_date,
                customer_id: reminder.customer_id,
                customerName: customer?.company_name || null,
                daysUntil,
                isOverdue: daysUntil < 0,
              };
            })
            .filter((r) => r.daysUntil <= 7 || r.isOverdue) // Show reminders within 7 days or overdue
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .slice(0, 10); // Show max 10 reminders

          setUpcomingReminders(upcoming);
        }

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">Rapporter</h1>
          <p className="text-lg text-primary/60">Överblick över din verksamhet</p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Value Card - Large */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col justify-between group hover:border-accent/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <BarChart3 className="h-6 w-6" />
            </div>
            <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">
              Total Försäljning
            </Badge>
          </div>
          <div className="mt-8">
            <div className="text-5xl font-bold text-primary tracking-tight">
              {stats.totalValue >= 1000000
                ? `${(stats.totalValue / 1000000).toFixed(1)}M`
                : `${(stats.totalValue / 1000).toFixed(0)}k`}
              <span className="text-2xl text-primary/40 font-normal ml-2">kr</span>
            </div>
            <p className="text-primary/60 mt-2">Totalt värde av accepterade offerter</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm hover:border-accent/30 transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-primary mb-4">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{stats.totalCustomers}</div>
          <div className="text-sm text-primary/60 font-medium">Totalt antal kunder</div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm hover:border-accent/30 transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-primary mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{stats.activeQuotes}</div>
          <div className="text-sm text-primary/60 font-medium">Aktiva offerter</div>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm hover:border-accent/30 transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-primary mb-4">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{stats.wonDeals}</div>
          <div className="text-sm text-primary/60 font-medium">Vunna affärer</div>
        </div>

        {/* Activity Feed - Tall */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-card rounded-3xl p-8 border border-border shadow-sm hover:border-accent/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-primary">Senaste Aktivitet</h3>
            <Button variant="ghost" size="sm" className="text-primary/40 hover:text-primary">
              Visa alla <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-primary/40">Inga aktiviteter ännu</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0 group-hover:scale-125 transition-transform" />
                  <div>
                    <p className="text-primary font-medium">{activity.description}</p>
                    <p className="text-sm text-primary/40 mt-1">
                      {new Date(activity.date).toLocaleDateString("sv-SE", {
                        month: "short",
                        day: "numeric",
                      })} • {new Date(activity.date).toLocaleTimeString("sv-SE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Reminders - Wide */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-card rounded-3xl p-8 border border-border shadow-sm hover:border-accent/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Kommande
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/paminnelser")} className="text-primary/40 hover:text-primary">
              Hantera <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-primary/40">Inga kommande påminnelser</div>
            ) : (
              upcomingReminders.slice(0, 3).map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      reminder.isOverdue ? "bg-red-500/10 text-red-500" : "bg-white text-primary"
                    )}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-primary">{reminder.title}</div>
                      <div className="text-xs text-primary/60">
                        {new Date(reminder.due_date).toLocaleDateString("sv-SE", { month: 'short', day: 'numeric' })}
                        {reminder.customerName && ` • ${reminder.customerName}`}
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    "border-0",
                    reminder.isOverdue ? "bg-red-500/10 text-red-500" : "bg-white text-primary"
                  )}>
                    {reminder.daysUntil === 0 ? "Idag" : `${reminder.daysUntil} dagar`}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
