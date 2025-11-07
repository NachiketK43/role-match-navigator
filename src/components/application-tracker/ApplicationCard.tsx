import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MoreVertical, Calendar } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['job_applications']['Row'];

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
  onStatusChange: (status: Database['public']['Enums']['application_status']) => void;
  onDelete: () => void;
}

export function ApplicationCard({ application, onClick, onStatusChange, onDelete }: ApplicationCardProps) {
  const daysAgo = formatDistanceToNow(new Date(application.updated_at), { addSuffix: true });
  
  return (
    <Card 
      className="p-6 hover:shadow-elevated transition-all cursor-pointer border-l-4 border-l-primary"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{application.company_name}</h3>
          </div>
          <p className="text-muted-foreground">{application.job_title}</p>
          {application.location && (
            <p className="text-sm text-muted-foreground">{application.location}</p>
          )}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <StatusBadge status={application.status} />
            {application.priority === 'high' && (
              <Badge variant="destructive">High Priority</Badge>
            )}
            {application.deadline && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Deadline: {new Date(application.deadline).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('applied'); }}>
              Mark as Applied
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('interviewing'); }}>
              Mark as Interviewing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('rejected'); }}>
              Mark as Rejected
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between pt-4 mt-4 border-t text-xs text-muted-foreground">
        <span>Updated {daysAgo}</span>
        {application.applied_date && (
          <span>Applied {new Date(application.applied_date).toLocaleDateString()}</span>
        )}
      </div>
    </Card>
  );
}
