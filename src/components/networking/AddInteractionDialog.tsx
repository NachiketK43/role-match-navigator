import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateInteraction } from '@/hooks/useInteractions';

const interactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  interaction_type: z.enum([
    'email',
    'call',
    'coffee_chat',
    'linkedin_message',
    'meeting',
    'referral_request',
    'thank_you',
    'other'
  ]),
  interaction_date: z.string().min(1, 'Date is required'),
  notes: z.string().max(10000).optional().or(z.literal('')),
  requires_followup: z.boolean().default(false),
  followup_date: z.string().optional().or(z.literal('')),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

interface AddInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
}

export function AddInteractionDialog({ open, onOpenChange, contactId }: AddInteractionDialogProps) {
  const createMutation = useCreateInteraction();
  
  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      title: '',
      interaction_type: 'email',
      interaction_date: new Date().toISOString().split('T')[0],
      notes: '',
      requires_followup: false,
      followup_date: '',
    },
    mode: 'onBlur',
  });

  const requiresFollowup = form.watch('requires_followup');

  const onSubmit = async (data: InteractionFormData) => {
    try {
      await createMutation.mutateAsync({
        contact_id: contactId,
        title: data.title,
        interaction_type: data.interaction_type,
        interaction_date: new Date(data.interaction_date).toISOString(),
        notes: data.notes || null,
        requires_followup: data.requires_followup,
        followup_date: data.followup_date ? new Date(data.followup_date).toISOString() : null,
        is_completed: true,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving interaction:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
          <DialogDescription>
            Record your interaction with this contact
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Coffee chat about job opportunities" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interaction Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="coffee_chat">Coffee Chat</SelectItem>
                        <SelectItem value="linkedin_message">LinkedIn Message</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="referral_request">Referral Request</SelectItem>
                        <SelectItem value="thank_you">Thank You</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Discussion points, key takeaways..." className="min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requires_followup"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Requires follow-up
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {requiresFollowup && (
              <FormField
                control={form.control}
                name="followup_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isValid}
              >
                Log Interaction
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
