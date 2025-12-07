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
    companyInfo?: any;
}

const MobileInvoiceList = ({
    invoices,
    onEdit,
    onDelete,
    onStatusChange,
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
                        className="bg-white py-3 px-4 flex items-center justify-between active:bg-gray-50 transition-colors h-full"
                        onClick={() => onEdit(invoice)}
                    >
                        {/* Left: Main Info */}
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-medium text-gray-500">#{invoice.invoice_number}</span>
                                {getStatusBadge(invoice.status)}
                            </div>

                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                                {(invoice as any).customer_name || "Okänd kund"}
                            </h4>

                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(invoice.due_date).toLocaleDateString("sv-SE")}</span>
                                </div>
                                <div className="font-medium text-gray-900">
                                    {Number(invoice.amount).toLocaleString("sv-SE")} kr
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions (Status only via kebab) -- or we can just remove Kebab if Swipe handles Edit/Delete?
                Actually, Kebab handles 'Status Change'. Swipe handles 'Edit/Delete'.
                We keep kebab for Business Logic actions.
            */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                {invoice.status === 'draft' && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(invoice.id, 'sent'); }}>
                                        <Send className="h-4 w-4 mr-2" />
                                        Markera som skickad
                                    </DropdownMenuItem>
                                )}

                                {invoice.status === 'sent' && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(invoice.id, 'paid'); }}>
                                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                        Markera som betald
                                    </DropdownMenuItem>
                                )}

                                {/* Fallback edit/delete in menu as well? Maybe redundtant but safe. Let's keep them removed to encourage swipe. */}
                                {/* Only showing Status actions here makes sense. */}
                                {invoice.status !== 'draft' && invoice.status !== 'sent' && (
                                    <DropdownMenuItem disabled>Inga åtgärder</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </SwipeableItem>
            ))}
        </div>
    );
};

export default MobileInvoiceList;
