import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Tack för ditt meddelande!",
      description: "Vi återkommer till dig så snart som möjligt.",
    });

    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <section className="py-24 bg-background border-t border-border" id="kontakt">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Mail className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-primary tracking-tight">
            Kontakta oss
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Har du frågor om Kundkollen? Vi hjälper dig gärna!
          </p>
        </div>

        <Card className="border-2 border-border">
          <CardContent className="p-12">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary font-medium">Namn</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Ditt namn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary font-medium">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="din@epost.se"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-primary font-medium">Meddelande</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  placeholder="Hur kan vi hjälpa dig?"
                  rows={5}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full mt-2"
              >
                {isSubmitting ? "Skickar..." : "Skicka meddelande"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactForm;
