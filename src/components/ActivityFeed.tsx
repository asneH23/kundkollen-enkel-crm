import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Bell, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "customer" | "quote" | "reminder";
  title: string;
  description: string;
  timestamp: string;
  icon: typeof Building2;
  color: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  if (activities.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 text-secondary/40 mx-auto mb-4" />
          <p className="text-secondary/80">Inga aktiviteter ännu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="border-b border-border/30 pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          Senaste aktiviteter
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className={`flex items-start gap-4 pb-4 ${
                  index !== activities.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                <div
                  className={`h-10 w-10 rounded flex items-center justify-center flex-shrink-0 ${activity.color} border border-accent/20`}
                >
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{activity.title}</p>
                  <p className="text-xs text-secondary/80 mt-1">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;

