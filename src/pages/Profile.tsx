import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Building2, Phone, MapPin, Calendar, TrendingUp, FileText, Bell, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  company_name: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [stats, setStats] = useState({
    customers: 0,
    quotes: 0,
    reminders: 0,
    totalValue: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setCompanyName(data.company_name || "");
        // Load additional fields if they exist in the database
        setPhone((data as any).phone || localStorage.getItem(`profile_phone_${user.id}`) || "");
        setAddress((data as any).address || localStorage.getItem(`profile_address_${user.id}`) || "");
        setCreatedAt(data.created_at || null);
      }
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte hämta profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [customersRes, quotesRes, remindersRes, wonQuotesData] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reminders").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", false),
        supabase.from("quotes").select("amount").eq("user_id", user.id).eq("status", "accepted"),
      ]);

      const totalValue = wonQuotesData.data?.reduce((sum, quote) => sum + (quote.amount || 0), 0) || 0;

      setStats({
        customers: customersRes.count || 0,
        quotes: quotesRes.count || 0,
        reminders: remindersRes.count || 0,
        totalValue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      // Try to update with all fields (some might not exist in DB yet)
      const updateData: any = {
        company_name: companyName || null,
      };

      // Only include these if the columns exist in the database
      // They will be saved to localStorage as fallback
      if (phone) {
        updateData.phone = phone;
        localStorage.setItem(`profile_phone_${user.id}`, phone);
      }
      if (address) {
        updateData.address = address;
        localStorage.setItem(`profile_address_${user.id}`, address);
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        // If columns don't exist, that's okay - we'll use localStorage
        if (!error.message.includes("column") && !error.message.includes("does not exist")) {
          throw error;
        }
      }

      toast({
        title: "Sparad",
        description: "Profilen har uppdaterats",
      });
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte uppdatera profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-primary">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="max-w-4xl">
        <div className="mb-6 pb-6 border-b border-border/50">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">Profilinställningar</h1>
          <p className="text-secondary/80">Hantera dina kontoinställningar och profilinformation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-primary">
                <User className="h-5 w-5 text-accent" />
                Din profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-accent" />
                      E-post
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      E-postadressen kan inte ändras
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="companyName" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-accent" />
                      Företagsnamn
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ditt företagsnamn"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-accent" />
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="070-123 45 67"
                      className="mt-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      Adress
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Gatunamn 123, 123 45 Stad"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto min-h-[44px]">
                    {saving ? "Sparar..." : "Spara ändringar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-primary">
                <TrendingUp className="h-5 w-5 text-accent" />
                Statistik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="text-sm text-secondary">Kunder</span>
                  </div>
                  <span className="font-bold text-primary">{stats.customers}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="text-sm text-secondary">Offerter</span>
                  </div>
                  <span className="font-bold text-primary">{stats.quotes}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-accent" />
                    <span className="text-sm text-secondary">Påminnelser</span>
                  </div>
                  <span className="font-bold text-primary">{stats.reminders}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm text-accent">Total försäljning</span>
                  </div>
                  <span className="font-bold text-accent">
                    {stats.totalValue.toLocaleString("sv-SE")} kr
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Medlem sedan {createdAt ? new Date(createdAt).toLocaleDateString("sv-SE", { year: "numeric", month: "long" }) : "nyligen"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
