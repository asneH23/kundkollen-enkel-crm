import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/kunder", label: "Kunder" },
    { path: "/offerter", label: "Offerter" },
    { path: "/paminnelser", label: "Påminnelser" },
    { path: "/rapporter", label: "Rapporter" },
  ];

  return (
    <nav className="border-b border-[#232328] bg-[#1A1A1C] shadow-sm h-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-10">
            <Link to="/" className="text-3xl font-extrabold tracking-tight text-[#F3F4F6] font-sans">
              Kundkollen
            </Link>
            {user && (
              <div className="hidden md:flex gap-5 font-medium">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-3 py-2 rounded-none text-lg transition-colors font-sans ${
                      location.pathname === item.path
                        ? "text-accent after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-accent after:rounded-full after:content-['']"
                        : "text-secondary hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-base text-secondary hidden sm:block font-sans">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profil">
                    <User className="h-5 w-5 mr-2" />
                    Profil
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-5 w-5 mr-2" />
                  Logga ut
                </Button>
              </>
            ) : (
              <Button asChild variant="default">
                <Link to="/auth">Logga in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
