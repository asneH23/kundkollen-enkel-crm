import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  link?: string;
  description?: string;
}

const StatCard = ({ title, value, icon: Icon, link, description }: StatCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        link ? "cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardContent className="p-0">
          <p className="text-sm font-medium text-secondary mb-1">{title}</p>
          <div className="text-3xl font-bold text-primary">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </CardContent>
        <div className="h-12 w-12 rounded bg-accent/10 flex items-center justify-center border border-border/50 group-hover:bg-accent/20 transition-colors">
          <Icon className="h-6 w-6 text-accent" />
        </div>
      </CardHeader>
    </Card>
  );
};

export default StatCard;

