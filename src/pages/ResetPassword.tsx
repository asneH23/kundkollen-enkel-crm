import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetComplete, setResetComplete] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Lösenorden matchar inte",
                description: "Vänligen se till att lösenorden är identiska.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Lösenordet är för kort",
                description: "Lösenordet måste vara minst 6 tecken långt.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setResetComplete(true);
            toast({
                title: "Lösenord uppdaterat!",
                description: "Ditt lösenord har ändrats. Du kan nu logga in med ditt nya lösenord.",
            });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/auth");
            }, 3000);
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
                {!resetComplete && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/auth")}
                        className="mb-6 text-primary border-border hover:border-accent hover:text-accent hover:bg-accent/5 flex items-center gap-2 font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Tillbaka till inloggning
                    </Button>
                )}

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            {resetComplete ? "Lösenord återställt!" : "Återställ lösenord"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {resetComplete
                                ? "Du omdirigeras till inloggningssidan..."
                                : "Ange ditt nya lösenord"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!resetComplete ? (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nytt lösenord</Label>
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

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
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

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Återställer..." : "Återställ lösenord"}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-accent" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Klart!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Ditt lösenord har uppdaterats. Du kan nu logga in med ditt nya lösenord.
                                    </p>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate("/auth")}
                                >
                                    Gå till inloggning
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
