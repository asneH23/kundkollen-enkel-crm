import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomerCard from "@/components/CustomerCard";
import { Plus, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
}

interface CustomerFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
}

const Customers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";

    // Svensk mobil: 070-123-45-67 (3-3-2-2)
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 8);
    const part4 = digits.slice(8, 10);

    return [part1, part2, part3, part4].filter(Boolean).join("-");
  };

  const normalizePhoneForSave = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits || null;
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte hämta kunder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
    });
    setEditingCustomer(null);
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        companyName: customer.company_name,
        contactPerson: customer.contact_person || "",
        email: customer.email || "",
        phone: formatPhone(customer.phone || ""),
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.companyName.trim()) {
      toast({
        title: "Fel",
        description: "Företagsnamn är obligatoriskt",
        variant: "destructive",
      });
      return;
    }

    try {
      const customerData = {
        company_name: formData.companyName.trim(),
        contact_person: formData.contactPerson.trim() || null,
        email: formData.email.trim() || null,
        phone: normalizePhoneForSave(formData.phone || ""),
      };

      if (editingCustomer) {
        const { error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", editingCustomer.id);

        if (error) throw error;

        toast({
          title: "Uppdaterad",
          description: "Kunden har uppdaterats",
        });
      } else {
        const { error } = await supabase.from("customers").insert({
          user_id: user.id,
          ...customerData,
        });

        if (error) throw error;

        toast({
          title: "Tillagd",
          description: "Kunden har lagts till",
        });
      }

      handleCloseDialog();
      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || `Kunde inte ${editingCustomer ? "uppdatera" : "lägga till"} kund`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna kund?")) return;

    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Borttagen",
        description: "Kunden har tagits bort",
      });

      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte ta bort kund",
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      customer.company_name.toLowerCase().includes(term) ||
      (customer.contact_person && customer.contact_person.toLowerCase().includes(term)) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-primary">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-2 tracking-tight">Kunder</h1>
          <p className="text-secondary-foreground/60 text-lg">Bygg starkare relationer med dina kunder.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="premium-button">
              <Plus className="mr-2 h-4 w-4" />
              Lägg till kund
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-black/10 text-primary sm:max-w-[600px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingCustomer ? "Redigera kund" : "Lägg till ny kund"}
              </DialogTitle>
            </DialogHeader>
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-4">
              <p className="text-xs text-blue-200">
                <strong>GDPR-information:</strong> Kunduppgifter sparas säkert och hanteras enligt dataskyddsförordningen (GDPR).
                Informationen används endast för att hantera dina kundrelationer och delas inte med tredje part.
                Du kan när som helst radera kunduppgifter.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-primary">Företagsnamn *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme AB"
                    required
                    className="premium-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-primary">Kontaktperson</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Anna Andersson"
                      className="premium-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-primary">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                      placeholder="070-123-45-67"
                      className="premium-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-primary">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="anna@acme.se"
                    className="premium-input"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" className="premium-button flex-1 h-11">
                  {editingCustomer ? "Uppdatera" : "Lägg till"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="h-11 border-black/10 text-primary hover:bg-black/5 hover:text-accent"
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Section - Black Hero Card */}
      <div className="bg-black rounded-3xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <div className="text-5xl font-bold text-white tracking-tight mb-1">
                {customers.length}
              </div>
              <p className="text-white/60 text-lg">Totalt antal kunder</p>
            </div>
          </div>
          <Badge className="bg-accent/20 text-accent hover:bg-accent/30 border-accent/30 text-sm px-4 py-2">
            Aktiva Kunder
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md pb-6 border-b border-black/5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 pointer-events-none" />
          <Input
            placeholder="Sök på företagsnamn, kontaktperson eller e-post"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input pl-10 h-11 text-base"
          />
        </div>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border-dashed border-black/10">
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20 shadow-glow">
            <Plus className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-3">
            {customers.length === 0 ? "Inga kunder ännu" : "Inga kunder matchar din sökning"}
          </h3>
          <p className="text-secondary-foreground/60 mb-8 max-w-md mx-auto">
            {customers.length === 0
              ? "Börja med att lägga till din första kund för att komma igång med din kundhantering."
              : "Prova att ändra din sökning eller filtrera för att hitta det du letar efter."}
          </p>
          {customers.length === 0 && (
            <Button onClick={() => handleOpenDialog()} className="premium-button px-8 py-6 text-lg">
              <Plus className="h-5 w-5 mr-2" />
              Lägg till din första kund
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={() => handleOpenDialog(customer)}
              onDelete={() => handleDelete(customer.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
