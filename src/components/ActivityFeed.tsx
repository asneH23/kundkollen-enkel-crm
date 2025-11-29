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
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-secondary">Inga aktiviteter ännu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-secondary flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          Senaste aktiviteter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className={`flex items-start gap-4 pb-4 ${
                  index !== activities.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div
                  className={`h-10 w-10 rounded flex items-center justify-center flex-shrink-0 ${activity.color}`}
                >
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{activity.title}</p>
                  <p className="text-xs text-secondary mt-1">{activity.description}</p>
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

