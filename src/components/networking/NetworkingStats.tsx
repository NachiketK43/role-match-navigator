import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Clock, Activity } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';

interface NetworkingStatsProps {
  contacts: Contact[];
}

export function NetworkingStats({ contacts }: NetworkingStatsProps) {
  const totalContacts = contacts.filter(c => c.is_active).length;
  
  const strongRelationships = contacts.filter(
    c => c.is_active && c.relationship_strength === 'strong'
  ).length;

  const pendingFollowups = contacts.filter(
    c => c.is_active && c.next_followup_date && new Date(c.next_followup_date) < new Date()
  ).length;

  const recentContacts = contacts.filter(
    c => c.is_active && c.last_contacted_date && 
    (Date.now() - new Date(c.last_contacted_date).getTime()) < 30 * 24 * 60 * 60 * 1000
  ).length;

  const stats = [
    {
      title: 'Total Contacts',
      period: 'All time',
      value: totalContacts.toString(),
      icon: Users,
      color: 'hsl(var(--primary))',
    },
    {
      title: 'Strong Relationships',
      period: 'Active connections',
      value: strongRelationships.toString(),
      icon: Heart,
      color: 'hsl(142 76% 36%)',
    },
    {
      title: 'Pending Follow-ups',
      period: 'Needs attention',
      value: pendingFollowups.toString(),
      icon: Clock,
      color: 'hsl(38 92% 50%)',
    },
    {
      title: 'Active (30 Days)',
      period: 'Recent activity',
      value: recentContacts.toString(),
      icon: Activity,
      color: 'hsl(262 83% 58%)',
    },
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
