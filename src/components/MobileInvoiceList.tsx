import {
    MoreVertical,
    Calendar,
    CreditCard,
    Send,
    Trash2,
    Edit2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/components/InvoiceCard";
import SwipeableItem from "./SwipeableItem";

interface MobileInvoiceListProps {
    invoices: Invoice[];
    onEdit: (invoice: Invoice) => void;
    onDelete: (invoice: Invoice) => void;
    onStatusChange: (id: string, status: string) => void;
    onSend: (invoice: Invoice) => void;
    companyInfo?: any;
}

const MobileInvoiceList = ({
    invoices,
    onEdit,
    onDelete,
    onStatusChange,
    onSend,
    companyInfo
}: MobileInvoiceListProps) => {

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Betald</Badge>;
            case "sent":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none"><Send className="w-3 h-3 mr-1" /> Skickad</Badge>;
            case "overdue":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none"><AlertTriangle className="w-3 h-3 mr-1" /> Förfallen</Badge>;
            case "cancelled":
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none shadow-none"><XCircle className="w-3 h-3 mr-1" /> Makulerad</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none shadow-none"><Clock className="w-3 h-3 mr-1" /> Utkast</Badge>;
        }
    };

    return (
        <div className="flex flex-col space-y-2 lg:hidden">
            {invoices.map((invoice) => (
                <SwipeableItem
                    key={invoice.id}
                    onEdit={() => onEdit(invoice)}
                    onDelete={() => onDelete(invoice)}
                    className="border-b border-gray-100 last:border-0"
                >
                    <div
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
                        onClick={() => onEdit(invoice)}
                    >
                        {/* Header Row: Customer & Amount */}
                        <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col min-w-0 pr-4">
                                <span className="font-semibold text-gray-900 text-base leading-tight truncate">{(invoice as any).customer_name || "Okänd kund"}</span>
                                <span className="text-xs text-gray-500 mt-0.5 font-mono">#{invoice.invoice_number}</span>
                            </div>
                            <div className="font-bold text-gray-900 whitespace-nowrap text-base">
                                {Number(invoice.amount).toLocaleString("sv-SE")} kr
                            </div>
                        </div>

                        {/* Footer Row: Status & Date/Kebab */}
                        <div className="flex justify-between items-center w-full mt-3 pt-3 border-t border-gray-50">
                            <div className="scale-90 origin-left">
                                {getStatusBadge(invoice.status)}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Explicit Send Button */}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSend(invoice);
                                    }}
                                >
                                    <Send className="h-3.5 w-3.5 mr-1.5" />
                                    {invoice.status === 'sent' ? 'Skicka igen' : 'Skicka'}
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

export default MobileInvoiceList;
