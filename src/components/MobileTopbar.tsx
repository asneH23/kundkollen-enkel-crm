import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HelpModal from "./HelpModal";
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  BarChart3,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

const MobileTopbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");

  const navItems = [
    { path: "/dashboard", label: "Översikt", icon: LayoutDashboard },
    { path: "/kunder", label: "Kunder", icon: Users },
    { path: "/offerter", label: "Offerter", icon: FileText },
    { path: "/paminnelser", label: "Påminnelser", icon: Bell },
    { path: "/rapporter", label: "Rapporter", icon: BarChart3 },
    { path: "/profil", label: "Profil", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      const storedName = localStorage.getItem(`profile_display_name_${user.id}`);
      if (storedName) {
        setDisplayName(storedName);
      }
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/5 shadow-sm min-h-[140px]">
      {/* Logo and Help */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
        <Link to="/" className="flex items-center gap-2 group no-underline outline-none border-none">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
            <img src="/logo.png" alt="Kundkollen Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="text-base font-bold text-primary tracking-tight block leading-none group-hover:text-accent transition-colors">Kundkollen</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <HelpModal>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-primary/60 hover:text-accent hover:bg-accent/10 rounded-lg"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </HelpModal>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="h-8 w-8 p-0 text-primary/60 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <nav className="flex items-center gap-2 px-4 py-3 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                  active
                    ? "text-white bg-primary shadow-md"
                    : "text-primary/70 hover:text-primary hover:bg-black/5"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  active ? "text-accent" : "text-primary/70"
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MobileTopbar;

