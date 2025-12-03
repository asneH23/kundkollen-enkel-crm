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
import { Bell, Clock, Trash2, Pencil, Search, Users, Calendar, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-2 tracking-tight">Påminnelser</h1>
          <p className="text-primary/70 text-lg">Håll koll på alla viktiga uppföljningar.</p>
        </div>

        <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleCloseDialog())}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="premium-button">
              <Bell className="mr-2 h-4 w-4" />
              Skapa påminnelse
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-black/10 text-primary sm:max-w-[600px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingReminder ? "Redigera påminnelse" : "Skapa ny påminnelse"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-primary">Titel *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="T.ex. Ring angående badrumsrenovering"
                    required
                    className="premium-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer" className="text-primary">Kund</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger className="premium-input">
                      <SelectValue placeholder="Välj kund (valfritt)" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-black/10 text-primary">
                      <SelectItem value="none" className="focus:bg-black/10 focus:text-primary">Ingen kund</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id} className="focus:bg-black/10 focus:text-primary">
                          {customer.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-primary">Beskrivning</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Vad ska göras?"
                    className="premium-input resize-none"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-2 text-primary">
                    <Calendar className="h-4 w-4 text-accent" />
                    Förfallodatum *
                  </Label>
                  <div className="relative group">
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="premium-input pr-12 cursor-pointer"
                    />
                    <label
                      htmlFor="dueDate"
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10 flex items-center justify-center w-8 h-8 rounded hover:bg-black/10 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const input = document.getElementById('dueDate') as HTMLInputElement;
                        if (input && 'showPicker' in input) {
                          input.showPicker();
                        } else {
                          input?.focus();
                          input?.click();
                        }
                      }}
                    >
                      <Calendar className="h-5 w-5 text-accent" />
                    </label>
                  </div>
                  <p className="text-xs text-primary/70">
                    Du får email-påminnelser 7 dagar, 1 dag, idag och om den blir försenad.
                  </p>
                </div>
              </div>

              <Button type="submit" className="premium-button w-full h-11">
                {editingReminder ? "Uppdatera påminnelse" : "Skapa påminnelse"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Section - Black Hero Card */}
      <div className="bg-black rounded-3xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                <Bell className="h-8 w-8" />
              </div>
              <div>
                <div className="text-5xl font-bold text-white tracking-tight mb-1">
                  {reminders.filter(r => !r.completed && new Date(r.due_date) >= new Date()).length}
                </div>
                <p className="text-white/60 text-lg">Kommande påminnelser</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-red-500/20 rounded-2xl p-4 border border-red-500/30">
                <div className="text-2xl font-bold text-red-400">
                  {reminders.filter(r => !r.completed && new Date(r.due_date) < new Date()).length}
                </div>
                <div className="text-red-400 text-sm">Försenade</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">
                  {reminders.filter(r => r.completed).length}
                </div>
                <div className="text-white/60 text-sm">Klara</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Notification Info */}
      <div className="glass-card rounded-xl p-4 border-accent/20">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 flex-shrink-0 shadow-glow">
            <Mail className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base text-primary mb-1">Automatiska email-påminnelser</h3>
            <p className="text-sm text-primary/70 leading-relaxed">
              Du får automatiskt email när påminnelser närmar sig: <span className="font-medium text-primary">7 dagar innan</span>, <span className="font-medium text-primary">1 dag innan</span>, <span className="font-medium text-primary">idag</span> och om de blir <span className="font-medium text-primary">försenade</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-black/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
          <Input
            placeholder="Sök på titel, beskrivning eller kund"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 premium-input">
            <SelectValue placeholder="Filtera status" />
          </SelectTrigger>
          <SelectContent className="glass-panel border-black/10 text-primary">
            <SelectItem value="active" className="focus:bg-black/10 focus:text-primary">Aktiva</SelectItem>
            <SelectItem value="completed" className="focus:bg-black/10 focus:text-primary">Klara</SelectItem>
            <SelectItem value="all" className="focus:bg-black/10 focus:text-primary">Alla</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredReminders.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center border-dashed border-black/10">
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20 shadow-glow">
            <Bell className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-3">
            {reminders.length === 0 ? "Inga påminnelser ännu" : "Inga påminnelser matchar dina filter"}
          </h3>
          <p className="text-primary/70 mb-8 max-w-md mx-auto">
            {reminders.length === 0
              ? "Börja med att skapa din första påminnelse för att aldrig missa en uppföljning."
              : "Prova att ändra dina filter eller söktermer för att hitta det du letar efter."}
          </p>
          {reminders.length === 0 && (
            <Button onClick={() => handleOpenDialog()} className="premium-button px-8 py-6 text-lg">
              <Bell className="h-5 w-5 mr-2" />
              Skapa din första påminnelse
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredReminders.map((reminder) => {
            const daysUntil = Math.ceil((new Date(reminder.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysUntil < 0;
            const isToday = daysUntil === 0;
            const isTomorrow = daysUntil === 1;

            return (
              <Card
                key={reminder.id}
                className={`group hover:shadow-md transition-all duration-200 border-l-4 ${reminder.completed
                  ? "opacity-60 border-l-border/50"
                  : isOverdue
                    ? "border-l-red-500/50 bg-red-500/5"
                    : isToday
                      ? "border-l-yellow-500/50 bg-yellow-500/5"
                      : isTomorrow
                        ? "border-l-blue-500/50 bg-blue-500/5"
                        : "border-l-accent/50"
                  } hover:border-l-accent border-border/50 hover:border-accent/40 bg-card/50`}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <Checkbox
                        checked={reminder.completed || false}
                        onCheckedChange={() =>
                          handleToggleComplete(reminder.id, reminder.completed || false)
                        }
                        className="h-4 w-4"
                      />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title Row */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${reminder.completed
                            ? "bg-muted/30 border border-border/50"
                            : isOverdue
                              ? "bg-red-500/20 border border-red-500/30 group-hover:bg-red-500/30"
                              : isToday
                                ? "bg-yellow-500/20 border border-yellow-500/30 group-hover:bg-yellow-500/30"
                                : isTomorrow
                                  ? "bg-blue-500/20 border border-blue-500/30 group-hover:bg-blue-500/30"
                                  : "bg-accent/15 border border-accent/25 group-hover:bg-accent/25"
                            }`}>
                            <Bell className={`h-4 w-4 ${reminder.completed
                              ? "text-secondary/50"
                              : isOverdue
                                ? "text-red-400"
                                : isToday
                                  ? "text-yellow-400"
                                  : isTomorrow
                                    ? "text-blue-400"
                                    : "text-accent"
                              }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold text-sm sm:text-base text-primary group-hover:text-accent transition-colors ${reminder.completed ? "line-through" : ""
                                }`}
                            >
                              {reminder.title}
                            </h3>
                            {!reminder.description && (
                              <div className="flex items-center gap-1.5 text-xs text-primary/70 mt-0.5">
                                <Clock className="h-3 w-3" />
                                <span>Skapad {new Date(reminder.created_at).toLocaleDateString("sv-SE")}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleOpenDialog(reminder)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleDelete(reminder.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      {reminder.description && (
                        <div className="ml-[44px] mb-2.5">
                          <p className="text-xs sm:text-sm text-primary/80 leading-relaxed bg-muted/30 rounded-md p-2 border border-border/30">
                            {reminder.description}
                          </p>
                        </div>
                      )}

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-2 ml-[44px] pt-2 border-t border-border/40">
                        {getCustomerName(reminder.customer_id) && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-xs font-medium">
                            <Users className="h-3 w-3 text-accent flex-shrink-0" />
                            <span className="text-primary/80">{getCustomerName(reminder.customer_id)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-xs font-medium">
                          <Calendar className="h-3 w-3 text-accent flex-shrink-0" />
                          <span className="text-primary/80">{new Date(reminder.due_date).toLocaleDateString("sv-SE", {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <Badge
                          variant={getPriorityVariant(reminder.due_date, reminder.completed)}
                          className={cn(
                            "text-xs font-medium px-2 py-1",
                            getPriorityVariant(reminder.due_date, reminder.completed) === "destructive" && "bg-red-500/20 text-red-400 border-red-500/40",
                            getPriorityVariant(reminder.due_date, reminder.completed) === "default" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
                            getPriorityVariant(reminder.due_date, reminder.completed) === "secondary" && "bg-secondary/20 text-secondary border-border/50"
                          )}
                        >
                          {getPriorityLabel(reminder.due_date, reminder.completed)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reminders;
