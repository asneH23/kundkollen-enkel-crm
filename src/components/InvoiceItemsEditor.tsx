import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

export type InvoiceItemType = 'service' | 'material' | 'other';

export interface InvoiceItem {
    id?: string; // Optional for new items
    description: string;
    quantity: number;
    unit_price: number;
    vat_rate: number;
    type: InvoiceItemType;
}

interface InvoiceItemsEditorProps {
    items: InvoiceItem[];
    onItemsChange: (items: InvoiceItem[]) => void;
    currency?: string;
}

const InvoiceItemsEditor = ({ items, onItemsChange, currency = 'kr' }: InvoiceItemsEditorProps) => {

    const handleAddItem = () => {
        const newItem: InvoiceItem = {
            description: "",
            quantity: 1,
            unit_price: 0,
            vat_rate: 25,
            type: 'service'
        };
        onItemsChange([...items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onItemsChange(newItems);
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onItemsChange(newItems);
    };

    // Calculate totals for display
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const totalVat = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.vat_rate / 100)), 0);
    const totalLabor = items
        .filter(item => item.type === 'service')
        .reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Fakturarader</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="h-8">
                    <Plus className="w-4 h-4 mr-1" /> Lägg till rad
                </Button>
            </div>

            <div className="space-y-3">
                {items.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/30">
                        Inga fakturarader än. Lägg till en för att specificera kostnader.
                    </div>
                )}

                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start bg-card p-3 rounded-lg border border-border shadow-sm">

                        {/* Description - Spans full width on mobile, 4 cols on desktop */}
                        <div className="col-span-12 sm:col-span-5">
                            <Label className="text-xs text-muted-foreground mb-1 block sm:hidden">Beskrivning</Label>
                            <Input
                                placeholder="Beskrivning"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                className="h-9"
                            />
                        </div>

                        {/* Type - 3 cols mobile */}
                        <div className="col-span-4 sm:col-span-2">
                            <Label className="text-xs text-muted-foreground mb-1 block sm:hidden">Typ</Label>
                            <Select
                                value={item.type}
                                onValueChange={(val) => handleItemChange(index, 'type', val)}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="service">Arbete</SelectItem>
                                    <SelectItem value="material">Material</SelectItem>
                                    <SelectItem value="other">Övrigt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Quantity - 2 cols mobile */}
                        <div className="col-span-2 sm:col-span-1">
                            <Label className="text-xs text-muted-foreground mb-1 block sm:hidden">Antal</Label>
                            <Input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="h-9 px-2 text-center"
                            />
                        </div>

                        {/* Price - 3 cols mobile */}
                        <div className="col-span-3 sm:col-span-2">
                            <Label className="text-xs text-muted-foreground mb-1 block sm:hidden">Pris/st</Label>
                            <Input
                                type="number"
                                min="0"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="h-9 px-2 text-right"
                            />
                        </div>

                        {/* Total & Delete - 3 cols mobile */}
                        <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                            <span className="text-sm font-medium pt-0 sm:pt-0 mt-6 sm:mt-0 block">
                                {(item.quantity * item.unit_price).toLocaleString()} {currency}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(index)}
                                className="h-8 w-8 text-destructive hover:text-destructive/90 -mr-2 mt-6 sm:mt-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Footer */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm border border-border/50">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Totalt exkl. moms:</span>
                    <span className="font-medium">{totalAmount.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Moms (25%):</span>
                    <span className="font-medium">{totalVat.toLocaleString()} {currency}</span>
                </div>
                {totalLabor > 0 && (
                    <div className="flex justify-between text-green-700">
                        <span>Varav arbetskostnad (ROT/RUT-grundande):</span>
                        <span className="font-bold">{totalLabor.toLocaleString()} {currency}</span>
                    </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border mt-2 text-base font-bold">
                    <span>Att betala:</span>
                    <span>{(totalAmount + totalVat).toLocaleString()} {currency}</span>
                </div>
            </div>
        </div>
    );
};

export default InvoiceItemsEditor;
