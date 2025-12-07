import {
    Phone,
    Mail,
    Trash2,
    Edit2
} from "lucide-react";
import SwipeableItem from "./SwipeableItem";
import { Badge } from "@/components/ui/badge";

interface Customer {
    id: string;
    company_name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
}

interface MobileCustomerListProps {
    customers: Customer[];
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
}

const MobileCustomerList = ({ customers, onEdit, onDelete }: MobileCustomerListProps) => {
    return (
        <div className="flex flex-col space-y-2 lg:hidden">
            {customers.map((customer) => (
                <SwipeableItem
                    key={customer.id}
                    onEdit={() => onEdit(customer)}
                    onDelete={() => onDelete(customer)}
                    className="border-b border-gray-100 last:border-0"
                >
                    <div
                        className="py-3 px-4 flex items-center justify-between active:bg-gray-50 transition-colors bg-white h-full"
                        onClick={() => onEdit(customer)} // Allow tap to edit/view details
                    >
                        {/* Left: Main Info */}
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                                {customer.company_name}
                            </h4>

                            <div className="flex flex-col gap-0.5 mt-1">
                                {customer.contact_person && (
                                    <span className="text-xs text-gray-500 truncate">
                                        {customer.contact_person}
                                    </span>
                                )}

                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                    {customer.phone && (
                                        <a
                                            href={`tel:${customer.phone}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 hover:text-green-600 transition-colors"
                                        >
                                            <Phone className="h-3 w-3" />
                                        </a>
                                    )}
                                    {customer.email && (
                                        <a
                                            href={`mailto:${customer.email}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                        >
                                            <Mail className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hint arrow or simple chevron could go here, but for now we keep it clean */}
                        {/* Keeping the kebab as a secondary option is good for discoverability though.
                Let's keep it but simplified or just rely on swipe?
                User asked for swipe actions. Let's do swipe AND tap-to-edit.
                I'll keep the kebab for now as fallback but make it smaller/subtle?
                Actually, let's remove it to forcefully demo the "Swipe" UX requested.
                "Swipe left to edit/delete" is a common pattern.
            */}
                    </div>
                </SwipeableItem>
            ))}
        </div>
    );
};

export default MobileCustomerList;
