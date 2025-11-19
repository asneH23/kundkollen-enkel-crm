import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Plus, Trash2 } from "lucide-react";

interface Customer {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
}

const Customers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Kunde inte hämta kunder",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const { error } = await supabase.from("customers").insert({
        user_id: user.id,
        company_name: companyName,
        contact_person: contactPerson || null,
        email: email || null,
        phone: phone || null,
      });

      if (error) throw error;

      toast({
        title: "Kund tillagd!",
        description: `${companyName} har lagts till.`,
      });

      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "Kunde inte lägga till kund",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Kund borttagen",
        description: `${name} har tagits bort.`,
      });

      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "Kunde inte ta bort kund",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Kunder</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Lägg till ny kund
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Företagsnamn *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Företagets namn"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Kontaktperson</Label>
                  <Input
                    id="contactPerson"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Namn på kontaktperson"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exempel.se"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="070-123 45 67"
                  />
                </div>
              </div>

              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Lägg till kund
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Dina kunder ({customers.length})</h2>
          {customers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Inga kunder än. Lägg till din första kund ovan!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{customer.company_name}</h3>
                        {customer.contact_person && (
                          <p className="text-sm text-muted-foreground">
                            Kontakt: {customer.contact_person}
                          </p>
                        )}
                        {customer.email && (
                          <p className="text-sm text-muted-foreground">
                            E-post: {customer.email}
                          </p>
                        )}
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground">
                            Telefon: {customer.phone}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteCustomer(customer.id, customer.company_name)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
