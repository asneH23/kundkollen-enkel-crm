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
  const [displayName, setDisplayName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [bankgiro, setBankgiro] = useState("");
  const [plusgiro, setPlusgiro] = useState("");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
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
        // Always prioritize database values (they persist across browsers)
        // Only use localStorage as fallback if database value is empty
        setCompanyName(data.company_name || localStorage.getItem(`profile_company_name_${user.id}`) || "");
        setDisplayName((data as any).display_name || localStorage.getItem(`profile_display_name_${user.id}`) || "");
        setBusinessEmail((data as any).business_email || localStorage.getItem(`profile_business_email_${user.id}`) || "");
        setPhone((data as any).phone || localStorage.getItem(`profile_phone_${user.id}`) || "");
        setAddress((data as any).address || localStorage.getItem(`profile_address_${user.id}`) || "");
        setOrgNumber(data.org_number || "");
        setContactPerson(data.contact_person || "");
        setBankgiro((data as any).bankgiro || "");
        setPlusgiro((data as any).plusgiro || "");
        setIban((data as any).iban || "");
        setBic((data as any).bic || "");
        setCreatedAt(data.created_at || null);
      } else {
        // If no data in database, try loading from localStorage as temporary fallback
        setCompanyName(localStorage.getItem(`profile_company_name_${user.id}`) || "");
        setDisplayName(localStorage.getItem(`profile_display_name_${user.id}`) || "");
        setBusinessEmail(localStorage.getItem(`profile_business_email_${user.id}`) || "");
        setPhone(localStorage.getItem(`profile_phone_${user.id}`) || "");
        setAddress(localStorage.getItem(`profile_address_${user.id}`) || "");
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
      // Save all fields to localStorage as fallback
      if (companyName.trim()) {
        localStorage.setItem(`profile_company_name_${user.id}`, companyName.trim());
      } else {
        localStorage.removeItem(`profile_company_name_${user.id}`);
      }

      if (displayName.trim()) {
        localStorage.setItem(`profile_display_name_${user.id}`, displayName.trim());
        // Trigger custom event to notify other components
        window.dispatchEvent(new CustomEvent('displayNameUpdated'));
      } else {
        localStorage.removeItem(`profile_display_name_${user.id}`);
        // Trigger event even when removing
        window.dispatchEvent(new CustomEvent('displayNameUpdated'));
      }

      if (businessEmail.trim()) {
        localStorage.setItem(`profile_business_email_${user.id}`, businessEmail.trim());
      } else {
        localStorage.removeItem(`profile_business_email_${user.id}`);
      }

      if (phone.trim()) {
        localStorage.setItem(`profile_phone_${user.id}`, phone.trim());
      } else {
        localStorage.removeItem(`profile_phone_${user.id}`);
      }

      if (address.trim()) {
        localStorage.setItem(`profile_address_${user.id}`, address.trim());
      } else {
        localStorage.removeItem(`profile_address_${user.id}`);
      }

      // Update all fields in database - this ensures data persists across browsers
      // Note: display_name is stored in localStorage only (not in database schema)
      const updateData: any = {
        company_name: companyName.trim() || null,
        business_email: businessEmail.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        org_number: orgNumber.trim() || null,
        contact_person: contactPerson.trim() || null,
        bankgiro: bankgiro.trim() || null,
        plusgiro: plusgiro.trim() || null,
        iban: iban.trim() || null,
        bic: bic.trim() || null,
      };

      // Save to Supabase database (primary storage - works across browsers)
      const { data: updatedData, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile in database:", error);
        // Show the actual error to help with debugging
        toast({
          title: "Kunde inte spara till databasen",
          description: error.message || "Okänt fel. Data sparades endast lokalt.",
          variant: "destructive",
        });
        return;
      }

      if (updatedData) {
        // Database update successful - data is now saved to your account

        // Data is now in database and will persist across all browsers and devices
        toast({
          title: "Sparad",
          description: "Profilen har uppdaterats och sparas i ditt konto",
        });
      } else {
        throw new Error("Uppdateringen lyckades inte");
      }
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
          <p className="text-primary/70">Hantera dina kontoinställningar och profilinformation</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Profile Card */}
          <Card className="border-border/50 bg-card/50 max-w-2xl mx-auto w-full">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-primary">
                <User className="h-5 w-5 text-accent" />
                Din profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
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
                    <p className="text-sm text-primary/70 mt-1">
                      E-postadressen kan inte ändras
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="displayName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-accent" />
                      Ditt namn
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Förnamn Efternamn"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPerson" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-accent" />
                      Kontaktperson (på dokument)
                    </Label>
                    <Input
                      id="contactPerson"
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Förnamn Efternamn"
                      className="mt-2"
                    />
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
                    <Label htmlFor="orgNumber" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-accent" />
                      Organisationsnummer
                    </Label>
                    <Input
                      id="orgNumber"
                      type="text"
                      value={orgNumber}
                      onChange={(e) => setOrgNumber(e.target.value)}
                      placeholder="556XXX-XXXX"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-accent" />
                      Företagets e-post
                      <span className="text-xs text-accent font-semibold">(Viktigt!)</span>
                    </Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="info@dittforetag.se"
                      className="mt-2"
                    />
                    <p className="text-sm text-accent/90 mt-2 font-medium bg-accent/10 p-3 rounded-lg border border-accent/20">
                      Denna e-post visas på dina PDF-offerter och är den adress kunder kontaktar dig på. Använd din företags-email, inte din personliga.
                    </p>
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

                  <div>
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

                {/* Payment Details Section */}
                <div className="pt-6 border-t border-border mt-2">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Betalningsuppgifter (Visas på fakturan)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankgiro" className="flex items-center gap-2">
                        Bankgiro
                      </Label>
                      <Input
                        id="bankgiro"
                        type="text"
                        value={bankgiro}
                        onChange={(e) => setBankgiro(e.target.value)}
                        placeholder="123-4567"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plusgiro" className="flex items-center gap-2">
                        Plusgiro
                      </Label>
                      <Input
                        id="plusgiro"
                        type="text"
                        value={plusgiro}
                        onChange={(e) => setPlusgiro(e.target.value)}
                        placeholder="12 34 56-7"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="iban" className="flex items-center gap-2">
                        IBAN (Internationellt)
                      </Label>
                      <Input
                        id="iban"
                        type="text"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="SE..."
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bic" className="flex items-center gap-2">
                        BIC/SWIFT
                      </Label>
                      <Input
                        id="bic"
                        type="text"
                        value={bic}
                        onChange={(e) => setBic(e.target.value)}
                        placeholder="NDE..."
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Medlem sedan {createdAt ? new Date(createdAt).toLocaleDateString("sv-SE", { year: "numeric", month: "long" }) : "nyligen"}</span>
                  </div>
                  <Button type="submit" disabled={saving} className="min-h-[44px]">
                    {saving ? "Sparar..." : "Spara ändringar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
