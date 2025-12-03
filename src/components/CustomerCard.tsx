import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CustomerCardProps {
  customer: any;
  onEdit: (customer: any) => void;
  onDelete: (id: string) => void;
}

const CustomerCard = ({ customer, onEdit, onDelete }: CustomerCardProps) => {
  return (
    <div className="group relative bg-card hover:bg-white transition-all duration-300 rounded-3xl p-6 border border-border hover:border-accent/30 hover:shadow-lg h-full flex flex-col select-none">
      <div className="flex justify-between items-start mb-6 gap-3">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="h-14 w-14 rounded-2xl bg-black/5 flex items-center justify-center text-primary/60 group-hover:text-primary group-hover:bg-accent/10 group-hover:text-accent transition-all duration-300 flex-shrink-0">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-xl font-bold text-primary tracking-tight group-hover:text-accent transition-colors duration-300 truncate cursor-help select-text">
                    {customer.company_name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent className="bg-white border border-black/10 text-primary max-w-xs p-3 rounded-xl shadow-lg">
                  <p className="text-sm">{customer.company_name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2 text-sm text-primary/60 mt-1">
              {customer.contact_person && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="bg-black/5 px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wide truncate max-w-full cursor-help select-text">
                        {customer.contact_person}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-black/10 text-primary max-w-xs p-3 rounded-xl shadow-lg">
                      <p className="text-sm">{customer.contact_person}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {!customer.contact_person && (
                <span className="bg-black/5 px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wide">
                  Ingen kontaktperson
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5 text-primary/60 hover:text-primary flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white border-black/10 shadow-xl p-2">
            <DropdownMenuItem onClick={() => onEdit(customer)} className="rounded-lg cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" /> Redigera
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(customer.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> Ta bort
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3 flex-1">
        {customer.email && (
          <a
            href={`mailto:${customer.email}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 transition-colors group/item"
          >
            <div className="h-8 w-8 rounded-lg bg-black/5 flex items-center justify-center text-primary/60 group-hover/item:text-primary transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-primary/80 truncate">{customer.email}</span>
          </a>
        )}

        {customer.phone && (
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 transition-colors group/item"
          >
            <div className="h-8 w-8 rounded-lg bg-black/5 flex items-center justify-center text-primary/60 group-hover/item:text-primary transition-colors">
              <Phone className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-primary/80 truncate">{customer.phone}</span>
          </a>
        )}


      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(customer)}
          className="text-primary/60 hover:text-accent hover:bg-accent/10 px-3 py-1.5 font-medium group/btn rounded-lg transition-all duration-300"
        >
          Hantera <span className="group-hover/btn:translate-x-1 transition-transform duration-300 ml-1">→</span>
        </Button>
      </div>
    </div>
  );
};

export default CustomerCard;
