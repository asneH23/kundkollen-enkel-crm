import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold text-primary mb-4">Sidan hittades inte</h2>
          <p className="text-lg text-primary/70 mb-8">
            Sidan du letar efter finns inte eller har flyttats.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="premium-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Gå tillbaka
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="premium-button"
          >
            <Home className="mr-2 h-4 w-4" />
            Till översikt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
