import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  FileText,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  CreditCard,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from './pdf/QuotePDF';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuoteCardProps {
  quote: any;
  onEdit: (quote: any) => void;
  onDelete: (quote: any) => void;
  onStatusChange: (id: string, status: string) => void;
  onClick: () => void;
  companyInfo?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    orgNumber?: string;
  };
  onConvertToInvoice?: (quote: any) => void;
}

const QuoteCard = ({ quote, onEdit, onDelete, onStatusChange, onClick, companyInfo, onConvertToInvoice }: QuoteCardProps) => {
  const [customer, setCustomer] = useState<any>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!quote.customer_id) {
        setLoadingCustomer(false);
        return;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', quote.customer_id)
        .single();

      if (!error && data) {
        setCustomer(data);
      }
      setLoadingCustomer(false);
    };

    fetchCustomer();
  }, [quote.customer_id]);

  const statusColors = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const statusLabels = {
    draft: "Utkast",
    sent: "Skickad",
    accepted: "Accepterad",
    rejected: "Avvisad",
  };

  const statusIcons = {
    draft: Clock,
    sent: Send,
    accepted: CheckCircle,
    rejected: XCircle,
  };

  const StatusIcon = statusIcons[quote.status as keyof typeof statusIcons];

  // Helper to render the primary action button
  const renderPrimaryAction = () => {
    switch (quote.status) {
      case 'draft':
        return (
          <Button
            onClick={(e) => { e.stopPropagation(); onStatusChange(quote.id, "sent"); }}
            className="bg-primary text-white hover:bg-primary/90 h-9 px-4 text-xs font-medium rounded-full"
          >
            <Send className="w-3 h-3 mr-2" />
            Skicka
          </Button>
        );
      case 'sent':
        return (
          <Button
            onClick={(e) => { e.stopPropagation(); onStatusChange(quote.id, "accepted"); }}
            className="bg-green-600 text-white hover:bg-green-700 h-9 px-4 text-xs font-medium rounded-full"
          >
            <CheckCircle className="w-3 h-3 mr-2" />
            Markera accepterad
          </Button>
        );
      case 'accepted':
        return (
          <div className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <CheckCircle className="w-3 h-3 mr-1.5" />
            Redan fakturerad?
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-card hover:bg-white transition-all duration-300 rounded-2xl p-5 border border-border hover:border-primary/20 hover:shadow-lg cursor-pointer animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-colors duration-300",
            quote.status === 'accepted' ? "bg-green-100 text-green-600" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
          )}>
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-primary group-hover:text-primary transition-colors line-clamp-1">
              {quote.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                {quote.customer_name || "Okänd kund"}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white p-1">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(quote); }}>
              <Pencil className="mr-2 h-4 w-4" /> Redigera
            </DropdownMenuItem>

            {/* Status Helpers in Menu */}
            {quote.status === 'draft' && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(quote.id, "sent"); }}>
                <Send className="mr-2 h-4 w-4" /> Markera som skickad
              </DropdownMenuItem>
            )}
            {quote.status === 'sent' && (
              <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(quote.id, "rejected"); }} className="text-red-600 focus:text-red-600">
                  <XCircle className="mr-2 h-4 w-4" /> Markera som nekad
                </DropdownMenuItem>
              </>
            )}

            {/* Always show convert option unless already converting/accepted maybe? No, let user convert whenever */}
            {onConvertToInvoice && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onConvertToInvoice(quote); }}>
                <CreditCard className="mr-2 h-4 w-4" /> Skapa faktura
              </DropdownMenuItem>
            )}

            {customer && !loadingCustomer && (
              <PDFDownloadLink
                document={
                  <QuotePDF
                    quote={quote}
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
                fileName={`offert-${quote.id.slice(0, 8)}.pdf`}
              >
                {({ loading }) => (
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Laddar...' : 'Ladda ner PDF'}
                  </DropdownMenuItem>
                )}
              </PDFDownloadLink>
            )}

            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(quote); }} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
            {quote.amount?.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">kr</span>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Datum</span>
          <div className="font-semibold text-primary">
            {format(new Date(quote.created_at), "d MMM", { locale: sv })}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="flex flex-col xs:flex-row justify-between xs:items-center mt-2 pt-2 border-t border-border/50 gap-2 xs:gap-0">
        <div className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center justify-center xs:justify-start gap-1.5 w-full xs:w-auto",
          statusColors[quote.status as keyof typeof statusColors]
        )}>
          <StatusIcon className="h-3 w-3" />
          {statusLabels[quote.status as keyof typeof statusLabels]}
        </div>

        {/* Primary Action Button */}
        <div onClick={(e) => e.stopPropagation()} className="w-full xs:w-auto flex justify-center xs:justify-end">
          {renderPrimaryAction()}
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
