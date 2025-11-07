import { FileText, RefreshCw, Calendar, Send, Mail, Upload, Gift, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Activity = Database['public']['Tables']['application_activities']['Row'];
type ActivityType = Database['public']['Enums']['activity_type'];

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  note: FileText,
  status_change: RefreshCw,
  interview_scheduled: Calendar,
  follow_up_sent: Send,
  response_received: Mail,
  document_submitted: Upload,
  offer_received: Gift,
  custom: Star
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto opacity-20 mb-2" />
        <p>No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.activity_type];
        const timeAgo = formatDistanceToNow(new Date(activity.activity_date), { addSuffix: true });
        
        return (
          <div key={activity.id} className="flex gap-3">
            <div className="relative">
              <div className="rounded-full bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              {index < activities.length - 1 && (
                <div className="absolute left-1/2 top-10 w-0.5 h-full bg-border -translate-x-1/2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
