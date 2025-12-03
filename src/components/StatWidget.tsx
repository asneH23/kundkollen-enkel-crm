import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatWidgetProps {
  title: string | React.ReactNode;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
}

const StatWidget = ({
  title,
  value,
  icon: Icon,
  description,
  onClick,
  className,
  iconClassName,
}: StatWidgetProps) => {
  return (
    <div
      className={cn(
        "glass-card p-6 relative overflow-hidden group transition-all duration-300 h-full flex flex-col justify-between",
        onClick ? "cursor-pointer hover:-translate-y-1" : "",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center transition-all duration-300",
          iconClassName?.includes("text-accent") ? "bg-white/10" : "bg-black/5"
        )}>
          <Icon className={cn("h-6 w-6 text-primary", iconClassName)} />
        </div>
      </div>

      <div>
        <div className="text-4xl font-bold tracking-tight mb-1">{value}</div>
        <div className={cn("text-sm font-medium opacity-60 uppercase tracking-wide", className ? "text-white/80" : "text-primary/60")}>
          {title}
        </div>
        {description && (
          <p className={cn("text-xs mt-2 opacity-40", className ? "text-white/60" : "text-primary/60")}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatWidget;

