import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([
    { id: 1, name: "Acme AB", contact: "Anna Andersson", email: "anna@acme.se" },
    { id: 2, name: "Tech Solutions", contact: "Bo Bergström", email: "bo@tech.se" },
  ]);

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
          <h1 className="text-4xl font-bold mb-2">Kundregister</h1>
          <p className="text-muted-foreground">Hantera alla dina kunder på ett ställe</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Lägg till kund
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="company">Företag</Label>
                  <Input id="company" placeholder="Företagsnamn" />
                </div>
                <div>
                  <Label htmlFor="contact">Kontaktperson</Label>
                  <Input id="contact" placeholder="För- och efternamn" />
                </div>
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input id="email" type="email" placeholder="epost@exempel.se" />
                </div>
                <Button className="w-full">Lägg till</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Mina kunder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer) => (
                  <Card key={customer.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{customer.contact}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Customers;
