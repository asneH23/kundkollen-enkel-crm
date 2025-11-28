import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Calendar, Pencil, Trash2 } from "lucide-react";
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
        return "Vunnen";
      case "sent":
        return "Skickad";
      case "draft":
        return "Utkast";
      default:
        return "Okänd";
    }
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary text-lg truncate">{title}</h3>
              <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3" />
                {customerName}
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

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {amount && (
              <div className="text-2xl font-bold text-primary">
                {amount.toLocaleString("sv-SE")} kr
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-secondary">
              <Calendar className="h-3 w-3" />
              {new Date(createdAt).toLocaleDateString("sv-SE")}
            </div>
          </div>
          <Badge variant={getStatusVariant(status)} className="ml-4">
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;

