import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [acceptGdpr, setAcceptGdpr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Välkommen tillbaka!",
          description: "Du är nu inloggad.",
        });
        navigate("/dashboard");
      } else {
        // Validation for signup
        if (password !== confirmPassword) {
          toast({
            title: "Lösenorden matchar inte",
            description: "Vänligen se till att lösenorden är identiska.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!acceptGdpr) {
          toast({
            title: "Godkänn GDPR",
            description: "Du måste acceptera villkoren för att skapa ett konto.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              company_name: companyName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Konto skapat!",
          description: "Du kan nu logga in.",
        });
        
        // Auto-login after signup
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Något gick fel",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Logga in" : "Skapa konto"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? "Välkommen tillbaka till Kundkollen"
              : "Kom igång med Kundkollen"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="company">Företagsnamn</Label>
                <Input
                  id="company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ditt företagsnamn"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.se"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minst 6 tecken"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Upprepa lösenordet"
                  required
                  minLength={6}
                />
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="gdpr"
                  checked={acceptGdpr}
                  onChange={(e) => setAcceptGdpr(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                  required
                />
                <Label htmlFor="gdpr" className="text-sm leading-relaxed cursor-pointer">
                  Jag accepterar att mina personuppgifter behandlas enligt{" "}
                  <a 
                    href="https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    GDPR
                  </a>
                  . Uppgifterna används endast för att ge dig tillgång till tjänsten och kommer inte delas med tredje part.
                </Label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Laddar..."
                : isLogin
                ? "Logga in"
                : "Skapa konto"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Inget konto? Skapa ett här"
                : "Har redan konto? Logga in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
