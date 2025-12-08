import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HelpModal from "./HelpModal";
import { HelpCircle, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const MobileHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm h-14">
      <div className="flex items-center justify-between px-4 h-full">
        <Link to="/" className="flex items-center gap-2 group no-underline outline-none border-none">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="Kundkollen Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-lg font-bold text-primary tracking-tight group-hover:text-accent transition-colors">
            Kundkollen
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profil")}
            className="h-9 w-9 text-muted-foreground hover:text-black hover:bg-black/5 rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>

          <HelpModal>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-black hover:bg-black/5 rounded-full"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </HelpModal>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;

