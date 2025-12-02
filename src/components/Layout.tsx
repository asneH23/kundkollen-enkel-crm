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
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:ml-72 transition-all duration-300 pt-20 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
          {/* Back button - show on all pages except dashboard */}
          {!isDashboard && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className={cn(
                "mb-6 text-secondary-foreground/60 hover:text-accent hover:bg-black/5",
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

