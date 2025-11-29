import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Camera, Mail, Building2, Phone, MapPin, Calendar, TrendingUp, FileText, Bell, Users } from "lucide-react";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [stats, setStats] = useState({
    customers: 0,
    quotes: 0,
    reminders: 0,
    totalValue: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      loadAvatar();
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
        setAvatarUrl((data as any).avatar_url || null);
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

  const loadAvatar = () => {
    if (!user) return;
    // Try to load from localStorage first (fallback if storage not available)
    const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "För stor fil",
        description: "Profilbilden får max vara 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      // Convert to base64 for localStorage (simple solution without backend changes)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Save to localStorage as fallback
        localStorage.setItem(`avatar_${user.id}`, base64String);
        setAvatarUrl(base64String);

        // Try to save to Supabase storage if available
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

          if (!uploadError) {
            const { data } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            
            setAvatarUrl(data.publicUrl);
            
            // Try to update profile with avatar_url
            await supabase
              .from("profiles")
              .update({ avatar_url: data.publicUrl })
              .eq("id", user.id);
          }
        } catch (storageError) {
          // Storage might not be set up, that's okay - we have localStorage
          console.log("Storage not available, using localStorage");
        }

        toast({
          title: "Profilbild uppdaterad",
          description: "Din profilbild har sparats",
        });
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte ladda upp bild",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const getInitials = () => {
    if (companyName) {
      return companyName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
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
    <div className="space-y-6">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Profilinställningar</h1>
          <p className="text-secondary">Hantera dina kontoinställningar och profilinformation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Din profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-border">
                      <AvatarImage src={avatarUrl || undefined} alt="Profilbild" />
                      <AvatarFallback className="bg-accent/10 text-accent text-2xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-background"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-primary mb-1">
                      {companyName || user?.email?.split("@")[0]}
                    </h3>
                    <p className="text-sm text-secondary mb-3">
                      Klicka på kameran för att ändra profilbild
                    </p>
                    {uploadingImage && (
                      <p className="text-xs text-muted-foreground">Laddar upp bild...</p>
                    )}
                  </div>
                </div>

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
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    {saving ? "Sparar..." : "Spara ändringar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
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
