import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BetaTester = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("beta_signups").insert({
        company_name: formData.companyName,
        email: formData.email,
        phone: formData.phone || null,
      });

      if (error) throw error;

      toast({
        title: "Välkommen som betatestare!",
        description: "Vi hör av oss så snart som möjligt med mer information.",
      });

      setFormData({ companyName: "", email: "", phone: "" });
    } catch (error: any) {
      toast({
        title: "Något gick fel",
        description: error.message || "Kunde inte skicka din anmälan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="beta" className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-primary-foreground">
            Bli en av våra första användare
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Anmäl dig som betatestare och få tidig tillgång till Kundkollen. 
            Hjälp oss forma framtidens enklaste CRM-verktyg.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-primary-foreground">Företagsnamn *</Label>
              <Input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Ditt företagsnamn"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary-foreground">E-postadress *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="din@email.se"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-primary-foreground">Telefonnummer (valfritt)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="070-123 45 67"
                className="bg-background"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              variant="secondary"
              className="w-full"
            >
              {isSubmitting ? "Skickar..." : "Bli betatestare"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BetaTester;
