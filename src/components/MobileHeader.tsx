import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HelpModal from "./HelpModal";
import { HelpCircle, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

const MobileHeader = ({ mobileMenuOpen, setMobileMenuOpen }: MobileHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm h-14 transition-all duration-300">
      <div className="flex items-center justify-between px-4 h-full max-w-7xl mx-auto">

        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group no-underline outline-none border-none">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300 bg-white">
            <img src="/logo.png" alt="Kundkollen Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-lg font-bold text-primary tracking-tight group-hover:text-accent transition-colors">
            Kundkollen
          </span>
        </Link>

        {/* Hamburger Menu - Integrated directly in header for perfect alignment */}
        {setMobileMenuOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 text-primary hover:text-black hover:bg-black/5 rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;

