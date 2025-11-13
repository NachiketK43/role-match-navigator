import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Trash2 } from 'lucide-react';
import { Interaction, useDeleteInteraction } from '@/hooks/useInteractions';

interface InteractionTimelineProps {
  interactions: Interaction[];
  contactId: string;
}

export function InteractionTimeline({ interactions, contactId }: InteractionTimelineProps) {
  const deleteInteraction = useDeleteInteraction();

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'call': return '📞';
      case 'coffee_chat': return '☕';
      case 'linkedin_message': return '💼';
      case 'meeting': return '🤝';
      case 'referral_request': return '🎯';
      case 'thank_you': return '🙏';
      default: return '💬';
    }
  };

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No interactions yet. Log your first interaction to track your relationship.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction, index) => (
        <div key={interaction.id} className="relative pl-8 pb-4">
          {index !== interactions.length - 1 && (
            <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
          )}
          <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary text-sm">
            {getInteractionIcon(interaction.interaction_type)}
          </div>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold">{interaction.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(interaction.interaction_date), 'MMM dd, yyyy')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {interaction.interaction_type.replace('_', ' ')}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => deleteInteraction.mutate({ id: interaction.id, contactId })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {interaction.notes && (
              <p className="text-sm text-muted-foreground">{interaction.notes}</p>
            )}
            {interaction.requires_followup && interaction.followup_date && (
              <div className="text-xs bg-warning/10 text-warning-foreground px-2 py-1 rounded-md inline-block">
                Follow-up: {format(new Date(interaction.followup_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
