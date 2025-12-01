import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "./Layout";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !user.email_confirmed_at) {
      // If user is not verified and not already on verification page, redirect
      if (location.pathname !== "/verifiera-email") {
        navigate("/verifiera-email");
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-primary">Laddar...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Don't show protected content if email is not verified
  if (!user.email_confirmed_at && location.pathname !== "/verifiera-email") {
    return null;
  }

  return <Layout>{children}</Layout>;
};
