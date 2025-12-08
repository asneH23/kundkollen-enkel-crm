import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { sv } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Bell, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface CalendarEvent {
    id: string;
    type: "reminder" | "invoice" | "quote";
    title: string;
    description: string;
    date: Date;
    amount?: number;
    status?: string;
}

interface WeekCalendarProps {
    events: CalendarEvent[];
}

const WeekCalendar = ({ events }: WeekCalendarProps) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Generate the 7 days of the current view
    const days = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

    const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
    const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
    const resetToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const getEventsForDay = (date: Date) => {
        return events.filter(event => isSameDay(event.date, date));
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case "reminder": return <Bell className="w-3 h-3" />;
            case "invoice": return <AlertCircle className="w-3 h-3" />;
            case "quote": return <FileText className="w-3 h-3" />;
            default: return <Bell className="w-3 h-3" />;
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case "reminder": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "invoice": return "bg-red-100 text-red-700 border-red-200";
            case "quote": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <Card className="border-border/50 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        Veckans Översikt
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={resetToToday} className="hidden sm:flex h-8 text-xs">
                            Idag
                        </Button>
                        <div className="flex items-center bg-white rounded-md border border-gray-200 shadow-sm">
                            <Button variant="ghost" size="icon" onClick={prevWeek} className="h-8 w-8 rounded-none rounded-l-md hover:bg-gray-50">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="px-3 py-1 text-sm font-medium border-l border-r border-gray-200 min-w-[100px] text-center">
                                v.{format(currentWeekStart, "w", { locale: sv })}
                            </div>
                            <Button variant="ghost" size="icon" onClick={nextWeek} className="h-8 w-8 rounded-none rounded-r-md hover:bg-gray-50">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {days.map((day) => {
                        const isTodayDate = isToday(day);
                        const dayEvents = getEventsForDay(day);

                        return (
                            <div key={day.toString()} className={cn(
                                "min-h-[120px] md:min-h-[200px] p-3 transition-colors hover:bg-gray-50/50 flex flex-col",
                                isTodayDate ? "bg-accent/5 ring-1 ring-inset ring-accent/20" : "bg-white"
                            )}>
                                {/* Date Header */}
                                <div className="flex items-center justify-between md:flex-col md:items-start mb-3 gap-1">
                                    <span className={cn(
                                        "text-sm font-medium capitalize",
                                        isTodayDate ? "text-accent" : "text-gray-500"
                                    )}>
                                        {format(day, "EEE", { locale: sv })}
                                    </span>
                                    <div className={cn(
                                        "h-7 w-7 flex items-center justify-center rounded-full text-sm font-bold",
                                        isTodayDate ? "bg-accent text-white shadow-sm" : "text-gray-900"
                                    )}>
                                        {format(day, "d")}
                                    </div>
                                </div>

                                {/* Events List */}
                                <div className="space-y-2 flex-grow">
                                    {dayEvents.length > 0 ? (
                                        dayEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "p-2 rounded-md border text-xs shadow-sm transition-all hover:shadow-md cursor-default group",
                                                    getEventColor(event.type)
                                                )}
                                            >
                                                <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                                                    {getEventIcon(event.type)}
                                                    <span className="truncate">{event.title}</span>
                                                </div>
                                                <div className="opacity-90 truncate text-[10px] leading-tight">
                                                    {event.description}
                                                </div>
                                                {event.amount && (
                                                    <div className="mt-1 font-mono font-medium opacity-100">
                                                        {event.amount.toLocaleString('sv-SE')} kr
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            {/* Only show empty state placeholder on desktop to save space on mobile */}
                                            <div className="hidden md:block text-xs text-gray-300 text-center font-medium select-none">
                                                -
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default WeekCalendar;
