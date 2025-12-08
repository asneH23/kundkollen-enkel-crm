import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import HelpModal from "@/components/HelpModal";
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  HelpCircle,
  CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobile?: boolean;
}

const Sidebar = ({ mobile }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");

  const navItems = [
    { path: "/dashboard", label: "Översikt", icon: LayoutDashboard },
    { path: "/kunder", label: "Kunder", icon: Users },
    { path: "/offerter", label: "Offerter", icon: FileText },
    { path: "/fakturor", label: "Fakturor", icon: CreditCard },
    { path: "/paminnelser", label: "Påminnelser", icon: Bell },
    { path: "/rapporter", label: "Rapporter", icon: BarChart3 },
    { path: "/profil", label: "Profil", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      // Try to get display_name from localStorage
      const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
      if (storedName) {
        setDisplayName(storedName);
      }
    }
  }, [user]);

  const SidebarContent = () => (
    <div className="h-full glass-panel flex flex-col relative overflow-hidden bg-card border border-white/50 shadow-xl">
      {/* Logo/Brand */}
      <div className="p-8 pb-8">
        <Link to="/" className="flex items-center gap-4 group no-underline outline-none border-none">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden">
            <img src="/logo.png" alt="Kundkollen Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="text-2xl font-bold text-primary tracking-tight block leading-none group-hover:text-accent transition-colors">Kundkollen</span>
            <span className="text-xs text-primary/70 font-medium tracking-wider uppercase mt-1 block group-hover:text-accent/80 transition-colors">CRM System</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                active
                  ? "text-white bg-primary shadow-lg scale-[1.02]"
                  : "text-primary/70 hover:text-primary hover:bg-white/50"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                active ? "text-accent" : "group-hover:text-primary"
              )} />
              <span className="relative z-10">{item.label}</span>
              {active && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(22,163,74,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Help Button */}
      <div className="px-4 pb-2">
        <HelpModal>
          <Button
            variant="ghost"
            className="w-full justify-start text-primary/70 hover:text-accent hover:bg-accent/10 rounded-xl"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Hjälp & Support
          </Button>
        </HelpModal>
      </div>

      {/* User Profile */}
      <div className="p-4 mt-auto">
        <div className="glass-card p-4 rounded-2xl bg-white/50 border border-white/60 mb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-primary font-bold">
              {displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary truncate">
                {displayName || user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-primary/70 truncate">
                {user?.email}
              </p>
            </div >
          </div>
        </div >
        <Button
          variant="ghost"
          className="w-full justify-start text-primary/70 hover:text-red-600 hover:bg-red-50 rounded-xl"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logga ut
        </Button>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-10 w-10 min-h-[40px] min-w-[40px] text-primary/80 hover:text-primary hover:bg-white/60 backdrop-blur-sm bg-white/40 border border-black/5 shadow-sm rounded-2xl m-3 transition-all duration-200"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={cn(
            "fixed left-0 top-0 h-full w-80 z-50 transition-transform duration-300 ease-out lg:hidden p-4",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent />
        </div>
      </>
    );
  }

  return <SidebarContent />;
};

export default Sidebar;

