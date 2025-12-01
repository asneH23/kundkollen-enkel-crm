import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, Calendar, Pencil, Trash2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  title: string;
  customerName: string;
  amount: number | null;
  status: string | null;
  createdAt: string;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
}

const QuoteCard = ({
  title,
  customerName,
  amount,
  status,
  createdAt,
  onEdit,
  onDelete,
  onClick,
}: QuoteCardProps) => {
  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case "accepted":
        return "default";
      case "sent":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "accepted":
        return "Accepterad";
      case "sent":
        return "Skickad";
      case "draft":
        return "Utkast";
      default:
        return "Okänd";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "accepted":
        return "bg-accent/10 border-accent/30";
      case "sent":
        return "bg-blue-500/10 border-blue-500/30";
      case "draft":
        return "bg-secondary/10 border-border";
      default:
        return "bg-secondary/10 border-border";
    }
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-accent/30 bg-card/50",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-primary text-lg sm:text-xl mb-2 break-words group-hover:text-accent transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{customerName}</span>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-8 sm:w-8 text-red-500 hover:text-red-600 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Amount Section */}
        {amount && (
          <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-border/50">
            <div className="text-2xl sm:text-3xl font-bold text-primary group-hover:text-accent transition-colors">
              {amount.toLocaleString("sv-SE")} kr
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-secondary">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(createdAt).toLocaleDateString("sv-SE")}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={getStatusVariant(status)} 
              className={cn(
                "text-xs font-medium",
                status === "accepted" && "bg-accent/20 text-accent border-accent/30",
                status === "sent" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                status === "draft" && "bg-secondary/20 text-secondary border-border"
              )}
            >
              {getStatusLabel(status)}
            </Badge>
          </div>
        </div>

        {/* Click to view hint */}
        {onClick && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-accent/80 group-hover:text-accent transition-colors">
              <Send className="h-3.5 w-3.5" />
              <span>Klicka för att se detaljer och skicka offert</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
