import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileText, CreditCard, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const MobileBottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const navItems = [
        { path: "/dashboard", label: "Hem", icon: LayoutDashboard },
        { path: "/kunder", label: "Kunder", icon: Users },
        // FAB goes here conceptually
        { path: "/offerter", label: "Offerter", icon: FileText },
        { path: "/fakturor", label: "Fakturor", icon: CreditCard },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleAction = (path: string) => {
        setOpen(false);
        navigate(path);
    };

    return (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
            <AnimatePresence>
                {open && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                            onClick={() => setOpen(false)}
                        />
                        <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-3 z-40 pb-2">
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="w-full flex justify-center"
                            >
                                <Button
                                    variant="outline"
                                    className="shadow-xl border-border/50 bg-white text-primary rounded-2xl pr-6 pl-4 h-14 flex items-center gap-3 w-[200px] justify-start hover:bg-gray-50"
                                    onClick={() => handleAction("/offerter?action=new")}
                                >
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="font-bold text-base">Ny Offert</span>
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                                className="w-full flex justify-center"
                            >
                                <Button
                                    variant="outline"
                                    className="shadow-xl border-border/50 bg-white text-primary rounded-2xl pr-6 pl-4 h-14 flex items-center gap-3 w-[200px] justify-start hover:bg-gray-50"
                                    onClick={() => handleAction("/fakturor?action=new")}
                                >
                                    <div className="bg-purple-100 p-2 rounded-full">
                                        <CreditCard className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="font-bold text-base">Ny Faktura</span>
                                </Button>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <nav className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl flex items-center justify-between px-2 h-16 relative z-50">
                {/* Left Group */}
                <div className="flex items-center justify-around flex-1">
                    {navItems.slice(0, 2).map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
                                    active ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-primary hover:bg-gray-50"
                                )}
                            >
                                <Icon
                                    strokeWidth={active ? 2.5 : 2}
                                    className="h-5 w-5 mb-0.5"
                                />
                                <span className="text-[10px] font-bold">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Center FAB */}
                <div className="relative -top-6 mx-2">
                    <Button
                        size="icon"
                        className={cn(
                            "h-14 w-14 rounded-full shadow-[0_8px_16px_rgba(22,163,74,0.4)] transition-all duration-300 border-4 border-background",
                            open ? "bg-red-500 hover:bg-red-600 rotate-45" : "bg-accent hover:bg-accent/90 hover:scale-105"
                        )}
                        onClick={() => setOpen(!open)}
                    >
                        <Plus className="h-7 w-7 text-white" />
                    </Button>
                </div>

                {/* Right Group */}
                <div className="flex items-center justify-around flex-1">
                    {navItems.slice(2, 4).map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
                                    active ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-primary hover:bg-gray-50"
                                )}
                            >
                                <Icon
                                    strokeWidth={active ? 2.5 : 2}
                                    className="h-5 w-5 mb-0.5"
                                />
                                <span className="text-[10px] font-bold">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default MobileBottomNav;
