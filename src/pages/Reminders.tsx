import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, Trash2, Pencil, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean | null;
  customer_id: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  company_name: string;
}

const Reminders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [customerId, setCustomerId] = useState("none");

  const fetchReminders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte hämta påminnelser",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, company_name")
        .eq("user_id", user.id)
        .order("company_name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte hämta kunder",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchCustomers();
  }, [user]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setCustomerId("none");
    setEditingReminder(null);
  };

  const handleOpenDialog = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      setTitle(reminder.title);
      setDescription(reminder.description || "");
      setDueDate(reminder.due_date ? reminder.due_date.split("T")[0] : "");
      setCustomerId(reminder.customer_id || "none");
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
    if (!user || !title.trim() || !dueDate) {
      toast({
        title: "Fel",
        description: "Titel och datum är obligatoriska",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingReminder) {
        const { error } = await supabase
          .from("reminders")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            due_date: new Date(dueDate).toISOString(),
            customer_id: customerId === "none" ? null : customerId,
          })
          .eq("id", editingReminder.id);

        if (error) throw error;

        toast({
          title: "Uppdaterad",
          description: "Påminnelsen har uppdaterats",
        });
      } else {
        const { error } = await supabase.from("reminders").insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          due_date: new Date(dueDate).toISOString(),
          customer_id: customerId === "none" ? null : customerId,
        });

        if (error) throw error;

        toast({
          title: "Skapad",
          description: "Påminnelsen har skapats",
        });
      }

      handleCloseDialog();
      fetchReminders();
    } catch (error: any) {
      toast({
        title: "Fel",
        description:
          error.message || `Kunde inte ${editingReminder ? "uppdatera" : "skapa"} påminnelse`,
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Uppdaterad",
        description: completed ? "Påminnelse markerad som ej slutförd" : "Påminnelse markerad som slutförd",
      });

      fetchReminders();
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte uppdatera påminnelse",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna påminnelse?")) return;

    try {
      const { error } = await supabase.from("reminders").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Borttagen",
        description: "Påminnelsen har tagits bort",
      });

      fetchReminders();
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte ta bort påminnelse",
        variant: "destructive",
      });
    }
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return null;
    const customer = customers.find(c => c.id === customerId);
    return customer?.company_name || "Okänd kund";
  };

  const getPriorityVariant = (dueDate: string, completed: boolean | null) => {
    if (completed) return "secondary";
    
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "destructive";
    if (days <= 3) return "destructive";
    if (days <= 7) return "default";
    return "secondary";
  };

  const getPriorityLabel = (dueDate: string, completed: boolean | null) => {
    if (completed) return "Klar";
    
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "Försenad";
    if (days === 0) return "Idag";
    if (days === 1) return "Imorgon";
    if (days <= 3) return "Akut";
    if (days <= 7) return "Inom en vecka";
    return "Kommande";
  };

  const filteredReminders = reminders.filter((reminder) => {
    if (statusFilter === "active" && reminder.completed) return false;
    if (statusFilter === "completed" && !reminder.completed) return false;

    const term = searchTerm.toLowerCase();
    if (!term) return true;

    const customerName = (getCustomerName(reminder.customer_id) || "").toLowerCase();
    return (
      reminder.title.toLowerCase().includes(term) ||
      (reminder.description && reminder.description.toLowerCase().includes(term)) ||
      customerName.includes(term)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Påminnelser</h1>
          <p className="text-secondary">Missa aldrig en viktig uppföljning</p>
        </div>

        <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleCloseDialog())}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Bell className="mr-2 h-4 w-4" />
              Skapa påminnelse
            </Button>
          </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingReminder ? "Redigera påminnelse" : "Skapa ny påminnelse"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="T.ex. Följ upp med Acme AB"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Kund</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kund (valfritt)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen kund</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Beskrivning</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Vad ska göras?"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Datum *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingReminder ? "Uppdatera påminnelse" : "Skapa påminnelse"}
                </Button>
              </form>
            </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
          <Input
            placeholder="Sök på titel, beskrivning eller kund"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtera status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktiva</SelectItem>
            <SelectItem value="completed">Klara</SelectItem>
            <SelectItem value="all">Alla</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredReminders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                <Bell className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {reminders.length === 0 ? "Inga påminnelser ännu" : "Inga påminnelser matchar dina filter"}
              </h3>
              <p className="text-secondary mb-6">
                {reminders.length === 0
                  ? "Börja med att skapa din första påminnelse för att komma igång."
                  : "Prova att ändra dina filter för att hitta fler resultat."}
              </p>
              {reminders.length === 0 && (
                <Button onClick={() => handleOpenDialog()}>
                  <Bell className="h-4 w-4 mr-2" />
                  Skapa din första påminnelse
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReminders.map((reminder) => (
            <Card
              key={reminder.id}
              className={`group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                reminder.completed ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Checkbox
                      checked={reminder.completed || false}
                      onCheckedChange={() =>
                        handleToggleComplete(reminder.id, reminder.completed || false)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-lg text-primary mb-1 ${
                          reminder.completed ? "line-through" : ""
                        }`}
                      >
                        {reminder.title}
                      </h3>
                      {reminder.description && (
                        <p className="text-sm text-secondary mb-2">{reminder.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-secondary">
                        {getCustomerName(reminder.customer_id) && (
                          <span>{getCustomerName(reminder.customer_id)}</span>
                        )}
                        <span>{new Date(reminder.due_date).toLocaleDateString("sv-SE")}</span>
                        <Badge variant={getPriorityVariant(reminder.due_date, reminder.completed)}>
                          {getPriorityLabel(reminder.due_date, reminder.completed)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(reminder)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger hover:text-danger"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reminders;
