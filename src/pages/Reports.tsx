import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, FileText, Bell, Calendar, AlertCircle } from "lucide-react";
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-border/50">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">Rapporter</h1>
        <p className="text-sm sm:text-base text-secondary/80">Snabba insikter baserade på dina offerter och accepterade affärer</p>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <Card className="rounded border-border/50 bg-card/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm sm:text-base font-semibold text-primary">Totala kunder</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary">{stats.totalCustomers}</div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded border-border/50 bg-card/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm sm:text-base font-semibold text-primary">Aktiva offerter</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary">{stats.activeQuotes}</div>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-accent flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded border-border/50 bg-card/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm sm:text-base font-semibold text-primary">Accepterade offerter</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary">{stats.wonDeals}</div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-accent flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded border-border/50 bg-card/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm sm:text-base font-semibold text-primary">Värde accepterade offerter</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary">
                  {stats.totalValue >= 1000000 
                    ? `${(stats.totalValue / 1000000).toFixed(1)}M`
                    : `${Math.round(stats.totalValue / 1000)}k`}
                </div>
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-accent flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <Card className="border-border/50 bg-card/50 mt-6 sm:mt-8">
            <CardHeader className="border-b border-border/30 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Kommande påminnelser
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/paminnelser")}
                  className="text-xs sm:text-sm min-h-[44px] sm:min-h-0"
                >
                  Visa alla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {upcomingReminders.map((reminder, index) => {
                  const getDaysText = () => {
                    if (reminder.isOverdue) {
                      return `${Math.abs(reminder.daysUntil)} dag${Math.abs(reminder.daysUntil) !== 1 ? "ar" : ""} försenad`;
                    } else if (reminder.daysUntil === 0) {
                      return "Idag";
                    } else if (reminder.daysUntil === 1) {
                      return "Imorgon";
                    } else if (reminder.daysUntil <= 7) {
                      return `${reminder.daysUntil} dag${reminder.daysUntil !== 1 ? "ar" : ""} kvar`;
                    } else {
                      return `${reminder.daysUntil} dagar kvar`;
                    }
                  };

                  return (
                    <div
                      key={reminder.id}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded border ${
                        index !== upcomingReminders.length - 1 ? "mb-2" : ""
                      } ${
                        reminder.isOverdue
                          ? "bg-red-500/10 border-red-500/30"
                          : reminder.daysUntil <= 1
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : "bg-muted/30 border-border/50"
                      }`}
                    >
                      <div className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10 rounded flex items-center justify-center flex-shrink-0",
                        reminder.isOverdue
                          ? "bg-red-500/20"
                          : reminder.daysUntil <= 1
                          ? "bg-yellow-500/20"
                          : "bg-accent/10"
                      )}>
                        {reminder.isOverdue ? (
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                        ) : (
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <p className="font-medium text-sm sm:text-base text-primary break-words">
                            {reminder.title}
                          </p>
                          <Badge
                            className={cn(
                              "text-xs flex-shrink-0 w-fit",
                              reminder.isOverdue
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : reminder.daysUntil <= 1
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-accent/20 text-accent border-accent/30"
                            )}
                          >
                            {getDaysText()}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
                          <p className="text-xs text-secondary/80">
                            {new Date(reminder.due_date).toLocaleDateString("sv-SE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {reminder.customerName && (
                            <>
                              <span className="text-xs text-secondary/60 hidden sm:inline">•</span>
                              <p className="text-xs text-secondary/80">Kund: {reminder.customerName}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {upcomingReminders.length >= 10 && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px]"
                    onClick={() => navigate("/paminnelser")}
                  >
                    Visa alla påminnelser
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activities */}
        <Card className="border-border/50 bg-card/50 mt-6 sm:mt-8">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold text-primary">Senaste aktiviteter</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-secondary/80">Inga aktiviteter ännu</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                      index !== activities.length - 1 ? "pb-4 border-b border-border/30" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base text-primary">{activity.description}</p>
                      <p className="text-xs sm:text-sm text-secondary/80 mt-1">
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
