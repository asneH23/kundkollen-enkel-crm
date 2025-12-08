
import {
    MoreVertical,
    Trash2,
    Send,
    CheckCircle,
    XCircle,
    Download,
    CreditCard,
    Calendar,
    AlertCircle,
    FileText,
    Pencil,
    User,
    ChevronRight
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "@/components/pdf/InvoicePDF";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

export interface Invoice {
    id: string;
    invoice_number: number;
    user_id: string;
    customer_id: string | null;
    quote_id: string | null;
    amount: number;
    issue_date: string;
    due_date: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    description: string | null;
    created_at: string;
    customer_name?: string; // Joined
    rot_rut_type?: 'ROT' | 'RUT' | null;
    rot_rut_amount?: number;
    labor_cost?: number;
    property_designation?: string;
}

interface InvoiceCardProps {
    invoice: Invoice;
    onDelete: (invoice: Invoice) => void;
    onStatusChange: (id: string, status: string) => void;
    onEdit?: (invoice: Invoice) => void;
    onClick?: () => void;
    companyInfo?: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
        orgNumber?: string;
    };
    onSend?: (invoice: Invoice) => void;
}

const InvoiceCard = ({ invoice, onDelete, onStatusChange, onEdit, onClick, companyInfo, onSend }: InvoiceCardProps) => {
    const [customer, setCustomer] = useState<any>(null);
    const [loadingCustomer, setLoadingCustomer] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!invoice.customer_id) {
                setLoadingCustomer(false);
                return;
            }

            const { data } = await supabase
                .from('customers')
                .select('*')
                .eq('id', invoice.customer_id)
                .single();

            if (data) {
                setCustomer(data);
            }
            setLoadingCustomer(false);
        };

        fetchCustomer();
    }, [invoice.customer_id]);

    const statusColors = {
        draft: "bg-gray-100 text-gray-700 border-gray-200",
        sent: "bg-blue-50 text-blue-700 border-blue-200",
        paid: "bg-green-50 text-green-700 border-green-200",
        overdue: "bg-red-50 text-red-700 border-red-200",
        cancelled: "bg-gray-100 text-gray-700 border-gray-200",
    };

    const statusLabels = {
        draft: "Utkast",
        sent: "Skickad",
        paid: "Betald",
        overdue: "Förfallen",
        cancelled: "Makulerad",
    };

    const statusIcons = {
        draft: FileText,
        sent: Send,
        paid: CheckCircle,
        overdue: AlertCircle,
        cancelled: XCircle,
    };

    const StatusIcon = statusIcons[invoice.status as keyof typeof statusIcons] || FileText;
    const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && invoice.status !== 'cancelled';

    // Helper to render the primary action button
    const renderPrimaryAction = () => {
        switch (invoice.status) {
            case 'draft':
                return (
                    <Button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(invoice.id, "sent"); }}
                        className="bg-primary text-white hover:bg-primary/90 h-9 px-4 text-xs font-medium rounded-full"
                    >
                        <Send className="w-3 h-3 mr-2" />
                        Skicka
                    </Button>
                );
            case 'sent':
                return (
                    <div className="flex items-center gap-2">
                        {/* Resend Button */}
                        <Button
                            onClick={(e) => { e.stopPropagation(); onSend?.(invoice); }}
                            className="bg-primary/10 text-primary hover:bg-primary/20 h-9 w-9 p-0 rounded-full"
                            title="Skicka igen"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={(e) => { e.stopPropagation(); onStatusChange(invoice.id, "paid"); }}
                            className="bg-green-600 text-white hover:bg-green-700 h-9 px-4 text-xs font-medium rounded-full"
                        >
                            <CreditCard className="w-3 h-3 mr-2" />
                            Registrera betalning
                        </Button>
                    </div>
                );
            case 'overdue':
                return (
                    <Button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(invoice.id, "sent"); }}
                        className="bg-primary/10 text-primary hover:bg-primary/20 h-9 px-4 text-xs font-medium rounded-full"
                    >
                        <Send className="w-3 h-3 mr-2" />
                        Skicka påminnelse
                    </Button>
                );
            case 'paid':
                return null;
            default:
                return null;
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-card hover:bg-white transition-all duration-300 rounded-2xl p-5 border border-border hover:border-primary/20 hover:shadow-lg cursor-pointer animate-in fade-in zoom-in-95 duration-200",
                isOverdue && "border-red-200 bg-red-50/10"
            )}
        >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                        invoice.status === 'paid' ? "bg-green-100 text-green-600" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white",
                        isOverdue && "bg-red-100 text-red-600"
                    )}>
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-primary group-hover:text-primary transition-colors line-clamp-1">
                                Faktura #{invoice.invoice_number}
                            </h3>
                            {isOverdue && (
                                <span className="flex items-center text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded-full">
                                    !
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <span className="truncate max-w-[180px] sm:max-w-[300px]">
                                {customer?.company_name || customer?.name || "Okänd kund"}
                            </span>
                        </div>

                        {invoice.rot_rut_type && invoice.rot_rut_amount && invoice.rot_rut_amount > 0 && (
                            <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 font-medium">
                                        {invoice.rot_rut_type}-avdrag (30%):
                                    </span>
                                    <span className="text-green-600 font-bold">
                                        -{new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(invoice.rot_rut_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-1 text-sm bg-gray-50 p-1.5 rounded-md">
                                    <span className="font-bold text-gray-900">Att betala:</span>
                                    <span className="font-bold text-gray-900">
                                        {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(invoice.amount - invoice.rot_rut_amount)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white p-1">
                        {onEdit && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(invoice); }}>
                                <Pencil className="mr-2 h-4 w-4" /> Redigera
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(invoice.id, "sent"); }}>
                            <Send className="mr-2 h-4 w-4" /> Markera som skickad
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSend?.(invoice); }}>
                            <Send className="mr-2 h-4 w-4" /> {invoice.status === 'sent' ? 'Skicka igen' : 'Skicka med e-post'}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(invoice.id, "paid"); }} className="text-green-600 focus:text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" /> Markera som betald
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(invoice.id, "cancelled"); }} className="text-gray-600">
                            <XCircle className="mr-2 h-4 w-4" /> Markera som makulerad
                        </DropdownMenuItem>

                        {customer && !loadingCustomer && (
                            <PDFDownloadLink
                                document={
                                    <InvoicePDF
                                        invoice={invoice}
                                        customer={{
                                            name: customer.company_name || customer.name || 'Okänd kund',
                                            email: customer.email,
                                            phone: customer.phone,
                                            company: customer.company_name,
                                            address: customer.address,
                                        }}
                                        companyInfo={companyInfo}
                                    />
                                }
                                fileName={`faktura-${invoice.invoice_number}.pdf`}
                            >
                                {({ loading }) => (
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Download className="mr-2 h-4 w-4" />
                                        {loading ? 'Laddar...' : 'Ladda ner PDF'}
                                    </DropdownMenuItem>
                                )}
                            </PDFDownloadLink>
                        )}

                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(invoice); }} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Ta bort
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Belopp</span>
                    <div className="font-bold text-lg text-primary">
                        {invoice.amount?.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">kr</span>
                    </div>
                </div>
                <div className={cn("bg-muted/30 rounded-xl p-3 border border-border/50", isOverdue && "bg-red-50 border-red-100")}>
                    <span className={cn("text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1", isOverdue && "text-red-600/70")}>
                        {isOverdue ? 'Förföll' : 'Förfaller'}
                    </span>
                    <div className={cn("font-semibold text-primary", isOverdue && "text-red-700")}>
                        {format(new Date(invoice.due_date), "d MMM", { locale: sv })}
                    </div>
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5",
                    statusColors[invoice.status as keyof typeof statusColors]
                )}>
                    <StatusIcon className="h-3 w-3" />
                    {statusLabels[invoice.status as keyof typeof statusLabels]}
                </div>

                {/* Primary Action Button */}
                <div onClick={(e) => e.stopPropagation()}>
                    {renderPrimaryAction()}
                </div>
            </div>
        </div>
    );
};

export default InvoiceCard;
