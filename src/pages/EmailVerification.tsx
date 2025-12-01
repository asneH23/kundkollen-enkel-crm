import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  // Get pending email from sessionStorage immediately (set during signup)
  const [pendingEmail, setPendingEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("pending_verification_email");
    }
    return null;
  });

  // Also update from sessionStorage in case it was set after component mount
  useEffect(() => {
    const email = sessionStorage.getItem("pending_verification_email");
    if (email && email !== pendingEmail) {
      setPendingEmail(email);
    }
  }, [pendingEmail]);

  useEffect(() => {
    // If we have pending email, show the page immediately (don't wait for auth)
    if (pendingEmail) {
      return;
    }

    // If no pending email, wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If we have a user, check verification status
    if (user) {
      // Check if user is already verified
      if (user.email_confirmed_at) {
        setIsVerified(true);
        // Clear pending email
        sessionStorage.removeItem("pending_verification_email");
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
      // If user exists but not verified, we're good to stay on this page
      return;
    }

    // If no user and no pending email, redirect to auth
    navigate("/auth");
  }, [user, authLoading, navigate, pendingEmail]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Ogiltig kod",
        description: "Vänligen ange en 6-siffrig verifieringskod",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const emailToVerify = user?.email || pendingEmail || "";
      if (!emailToVerify) {
        throw new Error("Ingen email hittades");
      }

      // Use "signup" type since we're verifying a signup email
      // This works with codes sent via resend with type "signup"
      const { error } = await supabase.auth.verifyOtp({
        email: emailToVerify,
        token: verificationCode,
        type: "signup",
      });

      if (error) throw error;

      // Clear pending email
      sessionStorage.removeItem("pending_verification_email");

      toast({
        title: "Email verifierad!",
        description: "Din email är nu verifierad. Du omdirigeras till dashboarden...",
      });

      setIsVerified(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Verifiering misslyckades",
        description: error.message || "Koden är ogiltig eller har gått ut. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const emailToUse = user?.email || pendingEmail;
    if (!emailToUse) return;

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      toast({
        title: "Verifieringskod skickad",
        description: "En ny verifieringskod har skickats till din email.",
      });
    } catch (error: any) {
      toast({
        title: "Kunde inte skicka kod",
        description: error.message || "Ett fel uppstod. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleQuickVerify = async () => {
    const emailToUse = user?.email || pendingEmail;
    if (!emailToUse) return;

    setLoading(true);

    try {
      // Send a new verification email with magic link
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      toast({
        title: "Verifieringslänk skickad",
        description: "Klicka på länken i mailet för att verifiera din email direkt.",
      });
    } catch (error: any) {
      toast({
        title: "Kunde inte skicka länk",
        description: error.message || "Ett fel uppstod. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If we have pending email, show the page immediately
  if (pendingEmail) {
    // Continue to render the verification form
  } else if (authLoading) {
    // Show loading only if we don't have pending email and auth is still loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="text-lg text-primary">Laddar...</div>
      </div>
    );
  } else if (!user) {
    // If no user and no pending email, don't render (will redirect in useEffect)
    return null;
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary">Email verifierad!</h2>
              <p className="text-secondary">Du omdirigeras till dashboarden...</p>
              <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            supabase.auth.signOut();
            navigate("/auth");
          }}
          className="mb-6 text-secondary hover:text-primary flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till inloggning
        </Button>

        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                <Mail className="h-8 w-8 text-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Verifiera din email
            </CardTitle>
            <CardDescription className="text-center">
              Vi har skickat en verifieringskod till
              <br />
              <span className="font-semibold text-primary">{user?.email || pendingEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Code Input Method */}
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-base font-medium">
                  Verifieringskod
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(value);
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground text-center">
                  Ange den 6-siffriga koden från ditt email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifierar...
                  </>
                ) : (
                  "Verifiera email"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Eller</span>
              </div>
            </div>

            {/* Quick Verify Button */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleQuickVerify}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Skickar...
                  </>
                ) : (
                  "Skicka verifieringslänk"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Klicka på länken i mailet för snabb verifiering
              </p>
            </div>

            {/* Resend Code */}
            <div className="pt-4 border-t border-border">
              <div className="text-center space-y-2">
                <p className="text-sm text-secondary">
                  Har du inte fått koden?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-accent hover:text-accent/80"
                >
                  {resending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Skickar...
                    </>
                  ) : (
                    "Skicka ny kod"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;

