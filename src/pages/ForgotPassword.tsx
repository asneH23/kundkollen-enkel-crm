import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/aterstall-losenord`,
            });

            if (error) throw error;

            setEmailSent(true);
            toast({
                title: "Email skickat!",
                description: "Kolla din inkorg för instruktioner om hur du återställer ditt lösenord.",
            });
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
                    onClick={() => navigate("/auth")}
                    className="mb-6 text-primary border-border hover:border-accent hover:text-accent hover:bg-accent/5 flex items-center gap-2 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Tillbaka till inloggning
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            Glömt lösenord?
                        </CardTitle>
                        <CardDescription className="text-center">
                            Ange din email så skickar vi instruktioner för återställning
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!emailSent ? (
                            <form onSubmit={handleResetPassword} className="space-y-4">
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

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Skickar..." : "Skicka återställningslänk"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => navigate("/auth")}
                                >
                                    Tillbaka till inloggning
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                                    <Mail className="h-8 w-8 text-accent" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Email skickat!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Vi har skickat instruktioner för återställning till <strong>{email}</strong>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Kolla din inkorg (och skräppost) för att fortsätta.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate("/auth")}
                                >
                                    Tillbaka till inloggning
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
