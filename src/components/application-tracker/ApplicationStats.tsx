import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Calendar, Clock } from 'lucide-react';
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
      label: 'Total Applications',
      value: totalCount,
      icon: Target,
      color: 'text-primary'
    },
    {
      label: 'Active Applications',
      value: activeCount,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      label: 'Interview Rate',
      value: `${interviewRate}%`,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      label: 'Avg Response Time',
      value: `${Math.round(avgResponseTime)} days`,
      icon: Clock,
      color: 'text-accent'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <Icon className={`h-12 w-12 ${stat.color} opacity-20`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
