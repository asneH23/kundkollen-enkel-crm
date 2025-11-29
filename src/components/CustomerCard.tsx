import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, User, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerCardProps {
  companyName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
}

const CustomerCard = ({
  companyName,
  contactPerson,
  email,
  phone,
  onEdit,
  onDelete,
  onClick,
}: CustomerCardProps) => {
  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }
    return phone;
  };

  const hasContactInfo = email || phone;
  const contactCount = (email ? 1 : 0) + (phone ? 1 : 0);

  return (
    <Card
      className={cn(
        "group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-border hover:border-accent/30",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-12 w-12 rounded bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary text-lg group-hover:text-accent transition-colors">{companyName}</h3>
              {contactPerson && (
                <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{contactPerson}</span>
                </p>
              )}
              {!contactPerson && hasContactInfo && (
                <p className="text-xs text-muted-foreground mt-1">
                  {contactCount} kontakt{contactCount > 1 ? "er" : ""}
                </p>
              )}
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
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {hasContactInfo && (
          <div className="space-y-2 pt-3 border-t border-border/50">
            {email && (
              <div className="flex items-center gap-2 text-sm text-secondary group-hover:text-primary transition-colors">
                <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center border border-border/50">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <span className="truncate flex-1">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-secondary group-hover:text-primary transition-colors">
                <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center border border-border/50">
                  <Phone className="h-4 w-4 text-accent" />
                </div>
                <span className="flex-1">{formatPhone(phone)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;

