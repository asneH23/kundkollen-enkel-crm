import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobile?: boolean;
}

const Sidebar = ({ mobile }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Översikt", icon: LayoutDashboard },
    { path: "/kunder", label: "Kunder", icon: Users },
    { path: "/offerter", label: "Offerter", icon: FileText },
    { path: "/paminnelser", label: "Påminnelser", icon: Bell },
    { path: "/rapporter", label: "Rapporter", icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="h-full glass-panel flex flex-col relative overflow-hidden bg-card border border-white/50 shadow-xl">
      {/* Logo/Brand */}
      <div className="p-8 pb-8">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-primary tracking-tight block leading-none">Kundkollen</span>
            <span className="text-xs text-primary/60 font-medium tracking-wider uppercase mt-1 block">CRM System</span>
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
                  : "text-primary/60 hover:text-primary hover:bg-white/50"
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

      {/* User Profile */}
      <div className="p-4 mt-auto">
        <div className="glass-card p-4 rounded-2xl bg-white/50 border border-white/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-primary font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary truncate">
                {user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-primary/60 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-primary/60 hover:text-red-600 hover:bg-red-50 rounded-xl"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logga ut
          </Button>
        </div>
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
          className="glass-panel h-12 w-12 min-h-[48px] min-w-[48px] text-primary hover:bg-black/5 m-4"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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

