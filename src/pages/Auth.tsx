import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(() => {
    // Load saved email from localStorage
    return localStorage.getItem("remembered_email") || "";
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [acceptGdpr, setAcceptGdpr] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if we have a saved email (means remember me was checked before)
    return !!localStorage.getItem("remembered_email");
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Set storage based on remember me preference
        // Supabase already uses localStorage by default, but we can ensure it persists
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Save email if "remember me" is checked
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        // Only show toast on desktop - on mobile it's in the way with the topbar
        if (!isMobile) {
          toast({
            title: "Välkommen tillbaka!",
            description: "Du är nu inloggad.",
          });
        }
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

        const { data, error } = await supabase.auth.signUp({
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

        // Save email if "remember me" is checked (for when they come back)
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        }

        // Save email temporarily for verification page (even if session isn't created yet)
        sessionStorage.setItem("pending_verification_email", email);

        toast({
          title: "Konto skapat!",
          description: "Ett verifieringsemail har skickats till din email.",
        });

        // Redirect immediately to email verification page
        navigate("/verifiera-email");
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
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6 text-primary border-border hover:border-accent hover:text-accent hover:bg-accent/5 flex items-center gap-2 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till startsidan
        </Button>

        <Card className="w-full">
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

              {isLogin && (
                <>
                  <div className="flex items-center justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() => navigate("/glomt-losenord")}
                      className="text-sm text-primary/70 hover:text-accent underline transition-colors"
                    >
                      Glömt lösenord?
                    </button>
                  </div>

                  <div className="flex items-center space-x-3 py-2 px-1 rounded hover:bg-muted/30 transition-colors">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className="h-5 w-5 border-2 border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-background"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className={`text-sm cursor-pointer font-semibold transition-colors flex-1 ${rememberMe ? "text-primary" : "text-secondary"
                        }`}
                    >
                      Håll mig inloggad
                    </Label>
                  </div>
                </>
              )}

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
                    Jag accepterar{" "}
                    <a
                      href="/integritet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline hover:no-underline font-semibold"
                    >
                      integritetspolicyn
                    </a>
                    {" "}och{" "}
                    <a
                      href="/villkor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline hover:no-underline font-semibold"
                    >
                      användarvillkoren
                    </a>
                    .
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
    </div>
  );
};

export default Auth;
