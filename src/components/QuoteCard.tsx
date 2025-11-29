import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, Calendar, Pencil, Trash2 } from "lucide-react";
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
        "group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border hover:border-accent/30",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "h-12 w-12 rounded flex items-center justify-center border group-hover:scale-110 transition-all duration-300",
              getStatusColor(status)
            )}>
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary text-lg truncate group-hover:text-accent transition-colors">{title}</h3>
              <p className="text-sm text-secondary flex items-center gap-1 mt-1 group-hover:text-primary transition-colors">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{customerName}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
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
              className="h-8 w-8 text-danger hover:text-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="space-y-2">
            {amount && (
              <div className="text-2xl font-bold text-primary group-hover:text-accent transition-colors">
                {amount.toLocaleString("sv-SE")} kr
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-secondary group-hover:text-primary transition-colors">
              <div className="h-6 w-6 rounded bg-muted/50 flex items-center justify-center border border-border/50">
                <Calendar className="h-3 w-3 text-accent" />
              </div>
              <span>{new Date(createdAt).toLocaleDateString("sv-SE")}</span>
            </div>
          </div>
          <Badge 
            variant={getStatusVariant(status)} 
            className={cn(
              "ml-4",
              status === "accepted" && "bg-accent/20 text-accent border-accent/30",
              status === "sent" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
              status === "draft" && "bg-secondary/20 text-secondary border-border"
            )}
          >
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;

