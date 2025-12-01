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
import { Plus, Search } from "lucide-react";

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">Kunder</h1>
          <p className="text-sm sm:text-base text-secondary/80">Hantera dina kundrelationer</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              Lägg till kund
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Redigera kund" : "Lägg till ny kund"}
              </DialogTitle>
            </DialogHeader>
            <div className="bg-muted/50 p-3 rounded-md mb-4">
              <p className="text-xs text-muted-foreground">
                <strong>GDPR-information:</strong> Kunduppgifter sparas säkert och hanteras enligt dataskyddsförordningen (GDPR). 
                Informationen används endast för att hantera dina kundrelationer och delas inte med tredje part. 
                Du kan när som helst radera kunduppgifter.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Företagsnamn *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Acme AB"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Kontaktperson</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Anna Andersson"
                />
              </div>
              <div>
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="anna@acme.se"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  placeholder="070-123-45-67"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1 min-h-[44px]">
                  {editingCustomer ? "Uppdatera" : "Lägg till"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="min-h-[44px]">
                  Avbryt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary/60" />
        <Input
          placeholder="Sök på företagsnamn, kontaktperson eller e-post"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full bg-card/50 border-border/50 focus:border-accent/50"
        />
      </div>
      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-12 sm:p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 rounded bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20">
                <Plus className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-primary mb-3">
                {customers.length === 0 ? "Inga kunder ännu" : "Inga kunder matchar din sökning"}
              </h3>
              <p className="text-secondary/80 mb-8 text-sm sm:text-base">
                {customers.length === 0
                  ? "Börja med att lägga till din första kund för att komma igång."
                  : "Prova att ändra din sökning för att hitta fler resultat."}
              </p>
              {customers.length === 0 && (
                <Button onClick={() => handleOpenDialog()} size="lg" className="min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till din första kund
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              companyName={customer.company_name}
              contactPerson={customer.contact_person}
              email={customer.email}
              phone={customer.phone}
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
