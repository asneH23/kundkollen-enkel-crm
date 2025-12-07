import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import OnboardingGuide from "./OnboardingGuide";
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
    <div className="min-h-screen bg-white lg:bg-background lg:p-6 flex gap-6 overflow-hidden h-screen lg:overflow-visible">
      {/* Floating Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Topbar */}
      <MobileHeader />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col lg:overflow-visible">
        <div className="flex-1 overflow-y-auto lg:rounded-3xl bg-white lg:bg-white/50 border-0 lg:border border-white/60 shadow-none lg:shadow-sm p-4 lg:p-8 pt-[180px] lg:pt-6 relative custom-scrollbar">
          {/* Back button - show on all pages except dashboard, hidden on mobile */}
          {!isDashboard && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className={cn(
                "mb-6 text-secondary-foreground/60 hover:text-accent hover:bg-black/5 rounded-full",
                "hidden lg:flex items-center gap-2"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka
            </Button>
          )}
          {children}
        </div>
      </main>


      {/* Onboarding Guide */}
      <OnboardingGuide />
    </div>
  );
};

export default Layout;

