import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Send, UserCheck, Timer } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['job_applications']['Row'];

interface ApplicationStatsProps {
  applications: Application[];
}

export function ApplicationStats({ applications }: ApplicationStatsProps) {
  const totalCount = applications.length;
  const activeCount = applications.filter(
    app => !['rejected', 'withdrawn', 'accepted'].includes(app.status)
  ).length;
  
  const interviewingCount = applications.filter(
    app => app.status === 'interviewing' || app.status === 'offer'
  ).length;
  const appliedCount = applications.filter(app => app.applied_date).length;
  const interviewRate = appliedCount > 0 ? Math.round((interviewingCount / appliedCount) * 100) : 0;
  
  const avgResponseTime = applications
    .filter(app => app.applied_date && app.updated_at)
    .reduce((acc, app) => {
      const applied = new Date(app.applied_date!).getTime();
      const updated = new Date(app.updated_at).getTime();
      const days = Math.floor((updated - applied) / (1000 * 60 * 60 * 24));
      return acc + days;
    }, 0) / Math.max(appliedCount, 1);

  const stats = [
    {
      title: 'Total Applications',
      period: 'All submissions',
      value: totalCount.toString(),
      icon: Briefcase,
      color: 'hsl(var(--primary))',
    },
    {
      title: 'Active Applications',
      period: 'In progress',
      value: activeCount.toString(),
      icon: Send,
      color: 'hsl(217 91% 60%)',
    },
    {
      title: 'Interview Rate',
      period: 'Success metric',
      value: `${interviewRate}%`,
      icon: UserCheck,
      color: 'hsl(142 76% 36%)',
    },
    {
      title: 'Avg Response Time',
      period: 'Days to hear back',
      value: `${Math.round(avgResponseTime)} days`,
      icon: Timer,
      color: 'hsl(262 83% 58%)',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="space-y-4">
              {/* Header with icon and title */}
              <div className="flex items-center gap-2">
                <Icon className="size-5" style={{ color: stat.color }} />
                <span className="text-base font-semibold">{stat.title}</span>
              </div>

              <div className="flex flex-col gap-1">
                {/* Period */}
                <div className="text-sm text-muted-foreground whitespace-nowrap">{stat.period}</div>

                {/* Value */}
                <div className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
