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
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: any;
  onEdit: (quote: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onClick: () => void;
}

const QuoteCard = ({ quote, onEdit, onDelete, onStatusChange, onClick }: QuoteCardProps) => {
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

  return (
    <div className="group relative bg-card hover:bg-white transition-all duration-300 rounded-3xl p-4 sm:p-6 border border-border hover:border-accent/30 hover:shadow-lg">
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={cn(
            "h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center transition-colors duration-300 flex-shrink-0",
            quote.status === 'accepted' ? "bg-accent/10 text-accent" : "bg-black/5 text-primary/60 group-hover:text-primary"
          )}>
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-primary tracking-tight group-hover:text-accent transition-colors duration-300 truncate pr-2">
              {quote.title}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-primary/60 mt-1 truncate">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{quote.customer_name || "Okänd kund"}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5 text-primary/60 hover:text-primary flex-shrink-0 -mr-2 sm:mr-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white border-black/10 shadow-xl p-2">
            <DropdownMenuItem onClick={() => onEdit(quote)} className="rounded-lg cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" /> Redigera
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(quote.id, "sent")} className="rounded-lg cursor-pointer">
              <Send className="mr-2 h-4 w-4" /> Markera som skickad
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(quote.id, "accepted")} className="rounded-lg cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50">
              <CheckCircle className="mr-2 h-4 w-4" /> Markera som vunnen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(quote.id, "rejected")} className="rounded-lg cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
              <XCircle className="mr-2 h-4 w-4" /> Markera som förlorad
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(quote.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> Ta bort
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-black/5 rounded-2xl p-2.5 sm:p-3">
          <div className="text-[10px] sm:text-xs text-primary/60 uppercase tracking-wider mb-1 font-medium">Värde</div>
          <div className="text-base sm:text-lg font-bold text-primary flex items-center gap-1 flex-wrap">
            {quote.amount?.toLocaleString()} <span className="text-xs sm:text-sm font-normal text-primary/60">kr</span>
          </div>
        </div>
        <div className="bg-black/5 rounded-2xl p-2.5 sm:p-3">
          <div className="text-[10px] sm:text-xs text-primary/60 uppercase tracking-wider mb-1 font-medium">Datum</div>
          <div className="text-base sm:text-lg font-bold text-primary truncate">
            {format(new Date(quote.created_at), "d MMM", { locale: sv })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 gap-2">
        <div className={cn(
          "px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 sm:gap-2 flex-shrink-0",
          statusColors[quote.status as keyof typeof statusColors]
        )}>
          <StatusIcon className="h-3 w-3" />
          {statusLabels[quote.status as keyof typeof statusLabels]}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          className="text-primary/60 hover:text-accent hover:bg-transparent p-0 h-auto font-medium group/btn text-xs sm:text-sm"
        >
          Öppna <span className="group-hover/btn:translate-x-1 transition-transform duration-300 ml-1">→</span>
        </Button>
      </div>
    </div>
  );
};

export default QuoteCard;
