import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileBottomNav = () => {
    const location = useLocation();

    const navItems = [
        { path: "/dashboard", label: "Hem", icon: LayoutDashboard },
        { path: "/kunder", label: "Kunder", icon: Users },
        { path: "/offerter", label: "Offerter", icon: FileText },
        { path: "/fakturor", label: "Fakturor", icon: CreditCard },
        { path: "/profil", label: "Profil", icon: User },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            {/* Simple gradient fade above nav to smooth content overlap */}
            <div className="absolute bottom-full left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            <nav className="bg-white/90 backdrop-blur-lg border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-between px-6 pb-safe pt-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "bottom-nav-item relative group py-2",
                                active ? "active text-accent" : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            {/* Active Indicator Dot */}
                            {active && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-accent opacity-100" />
                            )}

                            <Icon
                                strokeWidth={active ? 2.5 : 2}
                                className={cn(
                                    "h-6 w-6 transition-all duration-200 transform group-active:scale-90",
                                    active ? "text-accent" : "text-muted-foreground"
                                )}
                            />
                            <span className={cn(
                                "text-[10px] font-medium tracking-wide mt-1 transition-colors duration-200",
                                active ? "text-accent" : "text-muted-foreground"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default MobileBottomNav;
