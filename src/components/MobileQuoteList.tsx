import {
    Calendar,
    Send,
    CheckCircle2,
    Clock
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
}

const MobileQuoteList = ({ quotes, onEdit, onDelete, onView }: MobileQuoteListProps) => {

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
                        className="bg-white py-3 px-4 flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer h-full"
                        onClick={() => onView(quote)}
                    >
                        {/* Left: Main Info */}
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 truncate">{quote.title}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                                {getStatusBadge(quote.status)}
                                {quote.customer_name && (
                                    <span className="text-xs text-gray-500 truncate border-l border-gray-200 pl-2">
                                        {quote.customer_name}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(quote.created_at).toLocaleDateString("sv-SE")}</span>
                                </div>
                                {quote.amount && (
                                    <div className="font-medium text-gray-900">
                                        {Number(quote.amount).toLocaleString("sv-SE")} kr
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hint for interaction? Maybe just a chevron.
                            "Swipe for actions" is often hinted, but let's keep it minimal as requested.
                        */}
                    </div>
                </SwipeableItem>
            ))}
        </div>
    );
};

export default MobileQuoteList;
