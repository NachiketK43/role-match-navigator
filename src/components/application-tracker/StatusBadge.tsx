import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type ApplicationStatus = Database['public']['Enums']['application_status'];

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<ApplicationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  wishlist: { label: 'Wishlist', variant: 'outline' },
  applied: { label: 'Applied', variant: 'default' },
  screening: { label: 'Screening', variant: 'secondary' },
  interviewing: { label: 'Interviewing', variant: 'default' },
  offer: { label: 'Offer', variant: 'default' },
  accepted: { label: 'Accepted', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  withdrawn: { label: 'Withdrawn', variant: 'outline' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className="font-medium">
      {config.label}
    </Badge>
  );
}
