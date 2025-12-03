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

const Sidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/kunder", label: "Kunder", icon: Users },
    { path: "/offerter", label: "Offerter", icon: FileText },
    { path: "/paminnelser", label: "Påminnelser", icon: Bell },
    { path: "/rapporter", label: "Rapporter", icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="glass-panel h-12 w-12 min-h-[48px] min-w-[48px] text-primary hover:bg-black/5"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 z-40 transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full glass-panel border-r border-black/[0.08] flex flex-col relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-0 w-full h-64 bg-accent/5 blur-3xl -z-10 pointer-events-none" />

          {/* Logo/Brand */}
          <div className="p-8 pb-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
                <span className="text-primary font-bold text-xl">K</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-primary tracking-tight block leading-none">Kundkollen</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            <div className="px-4 mb-2">
              <p className="text-xs font-semibold text-primary/50 uppercase tracking-wider">Meny</p>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                    active
                      ? "text-primary bg-accent/10 shadow-md border border-accent/20"
                      : "text-primary/60 hover:text-accent hover:bg-black/5"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_rgba(22,163,74,0.5)]" />
                  )}
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                    active ? "text-accent" : "group-hover:text-accent"
                  )} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          {user && (
            <div className="p-4 m-4 rounded-xl bg-black/5 border border-black/5 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-primary font-bold shadow-lg">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">Inloggad som</p>
                  <p className="text-xs text-primary/60 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary/70 hover:text-accent hover:bg-black/5 h-9"
                  onClick={() => {
                    navigate("/profil");
                    setMobileOpen(false);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profilinställningar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-500/10 h-9"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logga ut
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30 animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

