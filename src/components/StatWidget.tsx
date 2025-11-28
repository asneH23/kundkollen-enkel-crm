import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StatWidgetProps {
  title: string;
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
      className={`group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary mb-1">{title}</p>
            <div className="text-3xl font-bold text-primary">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            <Icon className="h-6 w-6 text-accent" />
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

