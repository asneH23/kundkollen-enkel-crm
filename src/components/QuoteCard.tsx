import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Pencil, Trash2, ArrowRight } from "lucide-react";
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

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 relative overflow-hidden group transition-all duration-300",
        onClick && "cursor-pointer hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      {/* Hover Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 space-y-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-xl mb-2 break-words group-hover:text-accent transition-colors leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-secondary-foreground/60">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{customerName}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10 text-white/60 hover:text-white"
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
              className="h-8 w-8 hover:bg-red-500/10 text-red-400 hover:text-red-300"
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
        <div className="py-4 border-y border-white/5">
          {amount ? (
            <div className="text-3xl font-bold text-white group-hover:text-accent transition-colors tracking-tight">
              {amount.toLocaleString("sv-SE")} <span className="text-lg text-white/40 font-normal">kr</span>
            </div>
          ) : (
            <div className="text-white/30 italic text-sm">Belopp ej angivet</div>
          )}
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-secondary-foreground/60">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(createdAt).toLocaleDateString("sv-SE")}</span>
          </div>

          <Badge
            className={cn(
              "text-xs font-medium border-0",
              status === "accepted" && "bg-accent/20 text-accent",
              status === "sent" && "bg-blue-500/20 text-blue-400",
              status === "draft" && "bg-white/10 text-white"
            )}
          >
            {getStatusLabel(status)}
          </Badge>
        </div>

        {/* Click to view hint */}
        {onClick && (
          <div className="flex items-center gap-2 text-xs text-accent/60 group-hover:text-accent transition-colors pt-2">
            <span>Visa detaljer</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteCard;
