import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatWidgetProps {
  title: string | React.ReactNode;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  progress?: number; // 0-100
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}

const StatWidget = ({
  title,
  value,
  icon: Icon,
  description,
  progress,
  onClick,
}: StatWidgetProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 relative overflow-hidden group transition-all duration-300",
        onClick ? "cursor-pointer hover:-translate-y-1" : ""
      )}
      onClick={onClick}
    >
      {/* Hover Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-black/5 flex items-center justify-center border border-black/10 group-hover:border-accent/30 group-hover:bg-accent/10 transition-all duration-300 shadow-lg group-hover:shadow-glow">
            <Icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors duration-300" />
          </div>
          {progress !== undefined && (
            <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full border border-black/5">
              <span className="text-xs font-medium text-accent">{progress}%</span>
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-medium text-secondary-foreground/60 mb-1 uppercase tracking-wide">{title}</div>
          <div className="text-3xl font-bold text-primary tracking-tight mb-2 group-hover:text-accent transition-colors duration-300">{value}</div>
          {description && (
            <p className="text-xs text-secondary-foreground/40 group-hover:text-secondary-foreground/60 transition-colors">{description}</p>
          )}
        </div>

        {progress !== undefined && (
          <div className="mt-4 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent shadow-[0_0_8px_rgba(0,229,153,0.5)] transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatWidget;

