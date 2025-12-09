import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, CreditCard, Plus, BarChart3, Users, Bell } from "lucide-react";
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
        { path: "/bokforing", label: "Bokföring", icon: BarChart3 },
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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden pointer-events-none flex justify-center items-end">
            <div className="pointer-events-auto w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2rem] p-2 flex items-center justify-between relative">

                {/* Left Side Items */}
                {navItems.slice(0, 2).map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 gap-1",
                                active ? "bg-primary text-white shadow-lg scale-105" : "text-primary/60 hover:text-primary hover:bg-black/5"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", active && "text-accent")} />
                            <span className={cn("text-[10px] font-bold leading-none", active ? "text-white" : "text-primary/60")}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}

                {/* FAB Placeholder - Actual button is floating above */}
                <div className="w-14 h-14" />

                {/* Right Side Items */}
                {navItems.slice(2, 4).map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 gap-1",
                                active ? "bg-primary text-white shadow-lg scale-105" : "text-primary/60 hover:text-primary hover:bg-black/5"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", active && "text-accent")} />
                            <span className={cn("text-[10px] font-bold leading-none", active ? "text-white" : "text-primary/60")}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}

            </div>

            {/* FAB Button - Absolute Pos */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[34px] z-50 pointer-events-auto">
                <AnimatePresence>
                    {open && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[-1]"
                                onClick={() => setOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 min-w-max pb-4"
                            >
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

                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    className="w-full flex justify-center"
                                >
                                    <Button
                                        variant="outline"
                                        className="shadow-xl border-border/50 bg-white text-primary rounded-2xl pr-6 pl-4 h-14 flex items-center gap-3 w-[200px] justify-start hover:bg-gray-50"
                                        onClick={() => handleAction("/kunder?action=new")}
                                    >
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <Users className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="font-bold text-base">Ny Kund</span>
                                    </Button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: 0.15 }}
                                    className="w-full flex justify-center"
                                >
                                    <Button
                                        variant="outline"
                                        className="shadow-xl border-border/50 bg-white text-primary rounded-2xl pr-6 pl-4 h-14 flex items-center gap-3 w-[200px] justify-start hover:bg-gray-50"
                                        onClick={() => handleAction("/paminnelser?action=new")}
                                    >
                                        <div className="bg-yellow-100 p-2 rounded-full">
                                            <Bell className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <span className="font-bold text-base">Ny Påminnelse</span>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <Button
                    onClick={() => setOpen(!open)}
                    className={cn(
                        "h-16 w-16 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all duration-300 flex items-center justify-center p-0",
                        open
                            ? "bg-red-500 hover:bg-red-600 rotate-45 scale-90"
                            : "bg-[#22c55e] hover:bg-[#16a34a] scale-100 hover:scale-105"
                    )}
                >
                    <Plus className="h-8 w-8 text-white stroke-[3]" />
                </Button>
            </div>
        </div>
    );
};
