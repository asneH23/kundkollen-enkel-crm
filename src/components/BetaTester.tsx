import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

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
    <section id="beta" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-6 max-w-4xl">
        <Card className="border-2 border-accent/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-primary tracking-tight">
                Bli en av våra första användare
              </h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
                Anmäl dig som betatestare och få tidig tillgång till Kundkollen. 
                Hjälp oss forma framtidens enklaste CRM-verktyg.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-primary font-medium">Företagsnamn *</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Ditt företagsnamn"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary font-medium">E-postadress *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="din@email.se"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-primary font-medium">Telefonnummer (valfritt)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="070-123 45 67"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full mt-6"
              >
                {isSubmitting ? "Skickar..." : "Bli betatestare"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BetaTester;
