import { useEffect } from 'react';
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
import { useCreateContact, useUpdateContact, Contact } from '@/hooks/useContacts';

const contactSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').max(200).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  linkedin_url: z.string()
    .max(500)
    .refine((url) => !url || url === '' || /^https?:\/\/.+/.test(url), {
      message: 'Must be a valid URL'
    })
    .optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  job_title: z.string().max(200).optional().or(z.literal('')),
  contact_type: z.enum(['recruiter', 'employee', 'mentor', 'referral', 'connection']),
  relationship_strength: z.enum(['cold', 'warm', 'strong']),
  how_we_met: z.string().max(1000).optional().or(z.literal('')),
  notes: z.string().max(10000).optional().or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
}

export function ContactDialog({ open, onOpenChange, contact }: ContactDialogProps) {
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      company: '',
      job_title: '',
      contact_type: 'connection',
      relationship_strength: 'cold',
      how_we_met: '',
      notes: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        full_name: contact.full_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        linkedin_url: contact.linkedin_url || '',
        company: contact.company || '',
        job_title: contact.job_title || '',
        contact_type: contact.contact_type || 'connection',
        relationship_strength: contact.relationship_strength || 'cold',
        how_we_met: contact.how_we_met || '',
        notes: contact.notes || '',
      });
    } else {
      form.reset({
        full_name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        company: '',
        job_title: '',
        contact_type: 'connection',
        relationship_strength: 'cold',
        how_we_met: '',
        notes: '',
      });
    }
  }, [contact, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      if (contact) {
        await updateMutation.mutateAsync({ id: contact.id, updates: data });
      } else {
        await createMutation.mutateAsync({ 
          full_name: data.full_name,
          email: data.email || null,
          phone: data.phone || null,
          linkedin_url: data.linkedin_url || null,
          company: data.company || null,
          job_title: data.job_title || null,
          contact_type: data.contact_type,
          relationship_strength: data.relationship_strength,
          how_we_met: data.how_we_met || null,
          notes: data.notes || null,
          is_active: true,
          tags: null,
          last_contacted_date: null,
          next_followup_date: null 
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
          <DialogDescription>
            {contact 
              ? 'Update contact details and relationship information'
              : 'Add a new professional contact to your network'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/in/johndoe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Professional Details</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Acme Corp" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Senior Software Engineer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="recruiter">Recruiter</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="mentor">Mentor</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="connection">Connection</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationship_strength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship Strength *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cold">Cold</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="strong">Strong</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Additional Context</h3>

              <FormField
                control={form.control}
                name="how_we_met"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How We Met</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="LinkedIn, referral from Sarah, tech conference..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional notes..." className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {contact ? 'Update Contact' : 'Add Contact'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
