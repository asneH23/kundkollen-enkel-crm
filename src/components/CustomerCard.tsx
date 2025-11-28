import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, User, Pencil, Trash2 } from "lucide-react";
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

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-primary text-lg">{companyName}</h3>
              {contactPerson && (
                <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" />
                  {contactPerson}
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

        <div className="space-y-2">
          {email && (
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Mail className="h-4 w-4" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Phone className="h-4 w-4" />
              <span>{formatPhone(phone)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;

