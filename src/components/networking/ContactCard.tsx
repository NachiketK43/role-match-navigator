import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Mail, Linkedin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Contact } from '@/hooks/useContacts';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelationshipColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-success text-success-foreground';
      case 'warm': return 'bg-info text-info-foreground';
      case 'cold': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recruiter': return 'bg-primary text-primary-foreground';
      case 'employee': return 'bg-accent text-accent-foreground';
      case 'mentor': return 'bg-info text-info-foreground';
      case 'referral': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-elevated transition-all"
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(contact.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{contact.full_name}</h3>
              <p className="text-sm text-muted-foreground">{contact.job_title}</p>
            </div>
          </div>
        </div>

        {contact.company && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {contact.company}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {contact.email && (
            <Badge variant="outline" className="gap-1">
              <Mail className="h-3 w-3" />
              Email
            </Badge>
          )}
          {contact.linkedin_url && (
            <Badge variant="outline" className="gap-1">
              <Linkedin className="h-3 w-3" />
              LinkedIn
            </Badge>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge className={getTypeColor(contact.contact_type)}>
            {contact.contact_type}
          </Badge>
          <Badge className={getRelationshipColor(contact.relationship_strength)}>
            {contact.relationship_strength}
          </Badge>
        </div>

        {contact.last_contacted_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3 w-3" />
            Last contact: {format(new Date(contact.last_contacted_date), 'MMM dd, yyyy')}
          </div>
        )}

        {contact.next_followup_date && new Date(contact.next_followup_date) < new Date() && (
          <div className="text-xs bg-warning/10 text-warning-foreground px-3 py-2 rounded-md">
            ⚠️ Follow-up overdue
          </div>
        )}
      </CardContent>
    </Card>
  );
}
