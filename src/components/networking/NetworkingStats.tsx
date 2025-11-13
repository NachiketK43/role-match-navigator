import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
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
      value: totalContacts,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Strong Relationships',
      value: strongRelationships,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Pending Follow-ups',
      value: pendingFollowups,
      icon: Calendar,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Active (30 Days)',
      value: recentContacts,
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-card hover:shadow-elevated transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
