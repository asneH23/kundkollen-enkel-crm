import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Users, Calculator } from "lucide-react";

export default function MobileQuickActions() {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-24 right-4 z-50 lg:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-xl bg-accent hover:bg-accent/90 text-white"
                    >
                        <Plus className="h-8 w-8" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="mb-2 w-48 bg-white/95 backdrop-blur-sm">
                    <DropdownMenuItem
                        onClick={() => navigate("/offerter?action=new")}
                        className="flex items-center gap-2 p-3 cursor-pointer"
                    >
                        <FileText className="h-5 w-5 text-accent" />
                        <span>Ny Offert</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => navigate("/kunder?action=new")}
                        className="flex items-center gap-2 p-3 cursor-pointer"
                    >
                        <Users className="h-5 w-5 text-accent" />
                        <span>Ny Kund</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => navigate("/fakturor?action=new")}
                        className="flex items-center gap-2 p-3 cursor-pointer"
                    >
                        <Calculator className="h-5 w-5 text-accent" />
                        <span>Ny Faktura</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
