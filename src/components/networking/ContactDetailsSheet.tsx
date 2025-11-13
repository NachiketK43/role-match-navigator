import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Mail, 
  Phone, 
  Linkedin, 
  Calendar,
  Edit,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { Contact, useDeleteContact } from '@/hooks/useContacts';
import { useInteractions } from '@/hooks/useInteractions';
import { InteractionTimeline } from './InteractionTimeline';
import { AddInteractionDialog } from './AddInteractionDialog';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContactDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onEdit: (contact: Contact) => void;
}

export function ContactDetailsSheet({ open, onOpenChange, contact, onEdit }: ContactDetailsSheetProps) {
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data: interactions = [] } = useInteractions(contact?.id);
  const deleteMutation = useDeleteContact();

  if (!contact) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(contact.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(contact.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-2xl">{contact.full_name}</SheetTitle>
                  <SheetDescription>
                    {contact.job_title} {contact.company && `at ${contact.company}`}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(contact)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-primary text-primary-foreground">
                {contact.contact_type}
              </Badge>
              <Badge variant="outline">
                {contact.relationship_strength}
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {contact.company}
                </div>
              )}
              {contact.linkedin_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={contact.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    View LinkedIn Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-2 text-sm">
              {contact.last_contacted_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last contact:</span>
                  <span>{format(new Date(contact.last_contacted_date), 'MMM dd, yyyy')}</span>
                </div>
              )}
              {contact.next_followup_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next follow-up:</span>
                  <span>{format(new Date(contact.next_followup_date), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>

            {/* How We Met */}
            {contact.how_we_met && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">How We Met</h3>
                  <p className="text-sm text-muted-foreground">{contact.how_we_met}</p>
                </div>
              </>
            )}

            {/* Notes */}
            {contact.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Interactions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Interaction History</h3>
                <Button 
                  size="sm"
                  onClick={() => setShowInteractionDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Log Interaction
                </Button>
              </div>
              <InteractionTimeline interactions={interactions} contactId={contact.id} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AddInteractionDialog
        open={showInteractionDialog}
        onOpenChange={setShowInteractionDialog}
        contactId={contact.id}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {contact.full_name}? This will also delete all interactions with this contact. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
