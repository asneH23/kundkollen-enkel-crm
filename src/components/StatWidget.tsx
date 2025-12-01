import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  trend,
  onClick,
}: StatWidgetProps) => {
  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border hover:border-accent/30 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-medium text-secondary mb-1 group-hover:text-primary transition-colors">{title}</div>
            <div className="text-2xl sm:text-3xl font-bold text-primary group-hover:text-accent transition-colors">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2 group-hover:text-secondary transition-colors">{description}</p>
            )}
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0 ml-2">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
          </div>
        </div>
        {progress !== undefined && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatWidget;

