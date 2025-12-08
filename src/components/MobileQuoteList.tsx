import {
    CheckCircle2,
    Clock,
    Send,
    Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SwipeableItem from "./SwipeableItem";

interface Quote {
    id: string;
    title: string;
    amount: number | null;
    status: string | null;
    customer_id: string | null;
    created_at: string;
    description?: string | null;
    customer_name?: string;
}

interface MobileQuoteListProps {
    quotes: Quote[];
    onEdit: (quote: Quote) => void;
    onDelete: (quote: Quote) => void;
    onView: (quote: Quote) => void;
    onSend: (quote: Quote) => void;
}

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileQuoteList = ({ quotes, onEdit, onDelete, onView, onSend }: MobileQuoteListProps) => {

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case "accepted":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Accepterad</Badge>;
            case "sent":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none"><Send className="w-3 h-3 mr-1" /> Skickad</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none shadow-none"><Clock className="w-3 h-3 mr-1" /> Utkast</Badge>;
        }
    };

    return (
        <div className="flex flex-col space-y-2 lg:hidden">
            {quotes.map((quote) => (
                <SwipeableItem
                    key={quote.id}
                    onEdit={() => onEdit(quote)}
                    onDelete={() => onDelete(quote)}
                    className="border-b border-gray-100 last:border-0"
                >
                    <div
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
                        onClick={() => onView(quote)}
                    >
                        {/* Header Row: Title & Amount */}
                        <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col min-w-0 pr-4">
                                <span className="font-semibold text-gray-900 text-base leading-tight truncate">{quote.title}</span>
                                <span className="text-xs text-gray-500 mt-0.5 truncate">{quote.customer_name || "Okänd kund"}</span>
                            </div>
                            <div className="font-bold text-gray-900 whitespace-nowrap text-base">
                                {quote.amount ? Number(quote.amount).toLocaleString("sv-SE") : "0"} kr
                            </div>
                        </div>

                        {/* Footer Row: Status & Date */}
                        <div className="flex justify-between items-center w-full mt-3 pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="scale-90 origin-left">
                                    {getStatusBadge(quote.status)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(quote.created_at).toLocaleDateString("sv-SE")}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Direct Send Button */}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSend(quote);
                                    }}
                                >
                                    <Send className="h-3.5 w-3.5 mr-1.5" />
                                    Skicka
                                </Button>
                            </div>
                        </div>
                    </div>
                </SwipeableItem>
            ))}
            <p className="text-center text-xs text-muted-foreground pt-4 pb-8 italic">
                * Svep på kortet för att redigera eller ta bort
            </p>
        </div>
    );
};

export default MobileQuoteList;
