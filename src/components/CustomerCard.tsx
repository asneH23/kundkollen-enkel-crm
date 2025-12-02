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
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/30 group-hover:bg-accent/10 transition-all duration-300 shadow-lg group-hover:shadow-glow flex-shrink-0">
              <Users className="h-6 w-6 text-white group-hover:text-accent transition-colors duration-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg group-hover:text-accent transition-colors break-words leading-tight">{companyName}</h3>
              {contactPerson && (
                <p className="text-sm text-secondary-foreground/60 flex items-center gap-1 mt-1">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{contactPerson}</span>
                </p>
              )}
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

        {/* Contact Info Section */}
        {hasContactInfo && (
          <div className="space-y-2 pt-3 border-t border-white/5">
            {email && (
              <div className="flex items-center gap-2 text-sm text-secondary-foreground/60 group-hover:text-white/80 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 flex-shrink-0">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <span className="truncate flex-1 min-w-0">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-secondary-foreground/60 group-hover:text-white/80 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 flex-shrink-0">
                  <Phone className="h-4 w-4 text-accent" />
                </div>
                <span className="flex-1 min-w-0">{formatPhone(phone)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCard;

