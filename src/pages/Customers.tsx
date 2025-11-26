import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import { Plus, Trash2, Building2, Pencil } from "lucide-react";

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Kunder</h1>
          <p className="text-muted-foreground">Hantera dina kundrelationer</p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex gap-2">
            <Input
              placeholder="Sök på företagsnamn, kontaktperson eller e-post"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
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
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCustomer ? "Uppdatera" : "Lägg till"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Avbryt
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {customers.length === 0
                ? "Inga kunder ännu. Lägg till din första kund!"
                : "Inga kunder matchar din sökning."}
            </CardContent>
          </Card>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Företag</TableHead>
                  <TableHead>Kontaktperson</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="w-[80px] text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">{customer.company_name}</TableCell>
                    <TableCell>{customer.contact_person || "-"}</TableCell>
                    <TableCell className="break-all">{customer.email || "-"}</TableCell>
                    <TableCell>{customer.phone ? formatPhone(customer.phone) : "-"}</TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(customer)}
                        title="Redigera"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(customer.id)}
                        title="Ta bort"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Klicka på en rad för att se mer information om kunden.</TableCaption>
            </Table>

            <Sheet
              open={detailOpen}
              onOpenChange={(open) => {
                setDetailOpen(open);
                if (!open) {
                  setSelectedCustomer(null);
                }
              }}
            >
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </span>
                    {selectedCustomer?.company_name || "Kunddetaljer"}
                  </SheetTitle>
                </SheetHeader>
                {selectedCustomer && (
                  <div className="mt-6 space-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Kontaktperson</p>
                      <p className="font-medium">{selectedCustomer.contact_person || "Inte angivet"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">E-post</p>
                      <p className="font-medium break-all">{selectedCustomer.email || "Inte angivet"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Telefon</p>
                      <p className="font-medium">
                        {selectedCustomer.phone ? formatPhone(selectedCustomer.phone) : "Inte angivet"}
                      </p>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setDetailOpen(false);
                          handleOpenDialog(selectedCustomer);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Redigera
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDetailOpen(false);
                          handleDelete(selectedCustomer.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Ta bort
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </div>
  );
};

export default Customers;
