import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const BetaTester = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Välkommen som betatestare!",
      description: "Vi hör av oss så snart som möjligt med mer information.",
    });

    setEmail("");
    setIsSubmitting(false);
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

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Din e-postadress"
              required
              className="flex-1 bg-background"
            />
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              variant="secondary"
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
