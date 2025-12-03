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
    <div className="min-h-screen bg-background p-4 lg:p-6 flex gap-6 overflow-hidden h-screen">
      {/* Floating Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto rounded-3xl bg-white/50 border border-white/60 shadow-sm p-6 lg:p-8 relative custom-scrollbar">
          {/* Back button - show on all pages except dashboard */}
          {!isDashboard && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className={cn(
                "mb-6 text-secondary-foreground/60 hover:text-accent hover:bg-black/5 rounded-full",
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

      {/* Mobile Sidebar (handled within Sidebar component, but we need to ensure it doesn't conflict) */}
      <div className="lg:hidden fixed top-0 left-0 z-50">
        <Sidebar mobile />
      </div>
    </div>
  );
};

export default Layout;

