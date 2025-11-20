import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean | null;
  created_at: string;
}

const Reminders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

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
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte hämta påminnelser",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !dueDate) return;

    try {
      const { error } = await supabase.from("reminders").insert({
        user_id: user.id,
        title,
        description: description || null,
        due_date: new Date(dueDate).toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Framgång",
        description: "Påminnelse skapad",
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setOpen(false);
      fetchReminders();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skapa påminnelse",
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
        title: "Framgång",
        description: completed ? "Påminnelse markerad som ej slutförd" : "Påminnelse markerad som slutförd",
      });

      fetchReminders();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera påminnelse",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("reminders").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Framgång",
        description: "Påminnelse borttagen",
      });

      fetchReminders();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort påminnelse",
        variant: "destructive",
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="font-bold text-xl text-primary">
              Kundkollen
            </div>
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Påminnelser om uppföljning</h1>
          <p className="text-muted-foreground">Missa aldrig en viktig uppföljning</p>
        </div>

        <div className="mb-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="mr-2 h-4 w-4" />
                Skapa påminnelse
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Skapa ny påminnelse</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddReminder} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="T.ex. Följ upp med Acme AB"
                    required
                  />
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
                  <Label htmlFor="dueDate">Datum</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Skapa påminnelse
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {reminders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Inga påminnelser ännu. Skapa din första påminnelse!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className={reminder.completed ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <Checkbox
                        checked={reminder.completed || false}
                        onCheckedChange={() => handleToggleComplete(reminder.id, reminder.completed || false)}
                      />
                      <div className="flex gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg mb-1 ${reminder.completed ? "line-through" : ""}`}>
                            {reminder.title}
                          </h3>
                          {reminder.description && (
                            <p className="text-muted-foreground mb-2">{reminder.description}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Förfaller: {new Date(reminder.due_date).toLocaleDateString("sv-SE")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityVariant(reminder.due_date, reminder.completed)}>
                        {getPriorityLabel(reminder.due_date, reminder.completed)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
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
      </main>
    </div>
  );
};

export default Reminders;
