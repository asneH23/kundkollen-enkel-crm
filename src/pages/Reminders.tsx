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
import { Bell, Clock, Trash2, Pencil } from "lucide-react";
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-lg">Laddar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Påminnelser om uppföljning</h1>
          <p className="text-muted-foreground">Missa aldrig en viktig uppföljning</p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Sök på titel, beskrivning eller kund"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtera status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiva</SelectItem>
                <SelectItem value="completed">Klara</SelectItem>
                <SelectItem value="all">Alla</SelectItem>
              </SelectContent>
            </Select>
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

        {filteredReminders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {reminders.length === 0
                ? "Inga påminnelser ännu. Skapa din första påminnelse!"
                : "Inga påminnelser matchar dina filter."}
            </CardContent>
          </Card>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Titel</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Förfallodatum</TableHead>
                  <TableHead>Prioritet</TableHead>
                  <TableHead className="w-[80px] text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders.map((reminder) => (
                  <TableRow
                    key={reminder.id}
                    className={reminder.completed ? "opacity-60 cursor-pointer" : "cursor-pointer"}
                    onClick={() => {
                      setSelectedReminder(reminder);
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Checkbox
                        checked={reminder.completed || false}
                        onCheckedChange={() =>
                          handleToggleComplete(reminder.id, reminder.completed || false)
                        }
                      />
                    </TableCell>
                    <TableCell className={reminder.completed ? "line-through" : ""}>
                      {reminder.title}
                    </TableCell>
                    <TableCell>{getCustomerName(reminder.customer_id) || "-"}</TableCell>
                    <TableCell>
                      {new Date(reminder.due_date).toLocaleDateString("sv-SE")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(reminder.due_date, reminder.completed)}>
                        {getPriorityLabel(reminder.due_date, reminder.completed)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(reminder)}
                        className="mr-1"
                        title="Redigera"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Klicka på en rad för att se mer information om påminnelsen.</TableCaption>
            </Table>

            <Sheet
              open={detailOpen}
              onOpenChange={(open) => {
                setDetailOpen(open);
                if (!open) {
                  setSelectedReminder(null);
                }
              }}
            >
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </span>
                    {selectedReminder?.title || "Påminnelse"}
                  </SheetTitle>
                </SheetHeader>
                {selectedReminder && (
                  <div className="mt-6 space-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Kund</p>
                      <p className="font-medium">
                        {getCustomerName(selectedReminder.customer_id) || "Ingen kund angiven"}
                      </p>
                    </div>
                    {selectedReminder.description && (
                      <div>
                        <p className="text-muted-foreground">Beskrivning</p>
                        <p className="font-medium whitespace-pre-wrap">
                          {selectedReminder.description}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Förfallodatum</p>
                      <p className="font-medium">
                        {new Date(selectedReminder.due_date).toLocaleString("sv-SE")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={getPriorityVariant(selectedReminder.due_date, selectedReminder.completed)}>
                        {getPriorityLabel(selectedReminder.due_date, selectedReminder.completed)}
                      </Badge>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant={selectedReminder.completed ? "outline" : "default"}
                        onClick={() =>
                          handleToggleComplete(selectedReminder.id, selectedReminder.completed || false)
                        }
                      >
                        {selectedReminder.completed ? "Markera som ej klar" : "Markera som klar"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setDetailOpen(false);
                          handleOpenDialog(selectedReminder);
                        }}
                      >
                        Redigera
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDetailOpen(false);
                          handleDelete(selectedReminder.id);
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
      </main>
    </div>
  );
};

export default Reminders;
