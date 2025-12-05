
import {
    MoreVertical,
    Trash2,
    Send,
    CheckCircle,
    XCircle,
    Download,
    CreditCard,
    Calendar,
    AlertCircle
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
}

interface InvoiceCardProps {
    invoice: Invoice;
    onDelete: (invoice: Invoice) => void;
    onStatusChange: (id: string, status: string) => void;
    companyInfo?: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
        orgNumber?: string;
    };
}

const InvoiceCard = ({ invoice, onDelete, onStatusChange, companyInfo }: InvoiceCardProps) => {
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Betald</Badge>;
            case "sent":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Skickad</Badge>;
            case "overdue":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Förfallen</Badge>;
            case "cancelled":
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">Makulerad</Badge>;
            default:
                return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">Utkast</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sv-SE');
    };

    const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && invoice.status !== 'cancelled';

    return (
        <div className="glass-card hover:shadow-xl transition-all duration-300 group animate-enter border border-white/40 hover:border-white/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

            <div className="p-5 sm:p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-primary/50 uppercase tracking-widest">Faktura #{invoice.invoice_number}</span>
                            {isOverdue && (
                                <span className="flex items-center text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Förfallen
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-lg sm:text-xl text-primary leading-tight mb-1 line-clamp-1 group-hover:text-accent transition-colors">
                            {invoice.description || 'Faktura'}
                        </h3>
                        <p className="text-sm text-primary/60 line-clamp-1">
                            {invoice.customer_name || 'Okänd kund'}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-primary/40 hover:text-primary hover:bg-primary/5 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 glass-panel">
                            <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "sent")} className="rounded-lg cursor-pointer">
                                <Send className="mr-2 h-4 w-4" /> Markera som skickad
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "paid")} className="rounded-lg cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50">
                                <CheckCircle className="mr-2 h-4 w-4" /> Markera som betald
                            </DropdownMenuItem>
                            {/* PDF Download */}
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
                                    className="w-full"
                                >
                                    {({ loading }) => (
                                        <DropdownMenuItem className="rounded-lg cursor-pointer text-accent focus:text-accent focus:bg-accent/10">
                                            <Download className="mr-2 h-4 w-4" />
                                            {loading ? 'Förbereder PDF...' : 'Ladda ner PDF'}
                                        </DropdownMenuItem>
                                    )}
                                </PDFDownloadLink>
                            )}

                            <DropdownMenuItem onClick={() => onDelete(invoice)} className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" /> Ta bort
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Amount Section */}
                <div className="bg-black/5 rounded-2xl p-4 mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-primary/60 uppercase tracking-widest font-medium mb-1">Belopp</p>
                        <p className="text-xl font-bold text-primary">{invoice.amount?.toLocaleString("sv-SE")} kr</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-primary/60 uppercase tracking-widest font-medium mb-1">Status</p>
                        {getStatusBadge(invoice.status)}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs font-medium text-primary/50 pt-2 border-t border-black/5">
                    <div className="flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-full border border-black/5">
                        <Calendar className="h-3.5 w-3.5" />
                        Förfaller: {formatDate(invoice.due_date)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceCard;
