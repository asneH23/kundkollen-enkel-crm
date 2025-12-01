import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 transition-all duration-300 pt-16 lg:pt-0 bg-background/50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
          {/* Back button - show on all pages except dashboard */}
          {!isDashboard && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className={cn(
                "mb-4 sm:mb-6 text-secondary hover:text-primary",
                "flex items-center gap-2"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka
            </Button>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

