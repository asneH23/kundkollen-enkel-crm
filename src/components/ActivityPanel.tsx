import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
}

interface ActivityPanelProps {
  activities: Activity[];
  emptyMessage?: string;
}

const ActivityPanel = ({ activities, emptyMessage = "Inga aktiviteter ännu" }: ActivityPanelProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-secondary">Senaste aktivitet</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`pb-4 ${
                  index !== activities.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <p className="text-sm font-medium text-primary mb-1">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString("sv-SE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityPanel;

