import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateApplication, useUpdateApplication } from '@/hooks/useApplications';
import type { Database } from '@/integrations/supabase/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type Application = Database['public']['Tables']['job_applications']['Row'];
type ApplicationStatus = Database['public']['Enums']['application_status'];
type ApplicationPriority = Database['public']['Enums']['application_priority'];

const applicationSchema = z.object({
  company_name: z.string().trim().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  job_title: z.string().trim().min(1, 'Job title is required').max(200, 'Job title must be less than 200 characters'),
  job_url: z.string().trim().url('Invalid URL format').optional().or(z.literal('')),
  location: z.string().trim().max(200, 'Location must be less than 200 characters').optional(),
  salary_range: z.string().trim().max(100, 'Salary range must be less than 100 characters').optional(),
  job_description: z.string().trim().max(50000, 'Job description too long (max 50,000 characters)').optional(),
  status: z.enum(['wishlist', 'applied', 'screening', 'interviewing', 'offer', 'accepted', 'rejected', 'withdrawn']),
  priority: z.enum(['low', 'medium', 'high']),
  applied_date: z.string().optional(),
  deadline: z.string().optional(),
  recruiter_name: z.string().trim().max(200, 'Recruiter name must be less than 200 characters').optional(),
  recruiter_email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  recruiter_linkedin: z.string().trim().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  notes: z.string().trim().max(10000, 'Notes too long (max 10,000 characters)').optional(),
  resume_version: z.string().trim().max(200, 'Resume version must be less than 200 characters').optional(),
  cover_letter_used: z.string().trim().max(10000, 'Cover letter too long (max 10,000 characters)').optional()
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: Application | null;
}

export function ApplicationDialog({ open, onOpenChange, application }: ApplicationDialogProps) {
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company_name: '',
      job_title: '',
      job_url: '',
      location: '',
      salary_range: '',
      job_description: '',
      status: 'wishlist',
      priority: 'medium',
      applied_date: '',
      deadline: '',
      recruiter_name: '',
      recruiter_email: '',
      recruiter_linkedin: '',
      notes: '',
      resume_version: '',
      cover_letter_used: ''
    }
  });

  useEffect(() => {
    if (application) {
      form.reset({
        company_name: application.company_name,
        job_title: application.job_title,
        job_url: application.job_url || '',
        location: application.location || '',
        salary_range: application.salary_range || '',
        job_description: application.job_description || '',
        status: application.status,
        priority: application.priority || 'medium',
        applied_date: application.applied_date || '',
        deadline: application.deadline || '',
        recruiter_name: application.recruiter_name || '',
        recruiter_email: application.recruiter_email || '',
        recruiter_linkedin: application.recruiter_linkedin || '',
        notes: application.notes || '',
        resume_version: application.resume_version || '',
        cover_letter_used: application.cover_letter_used || ''
      });
    } else {
      form.reset({
        company_name: '',
        job_title: '',
        job_url: '',
        location: '',
        salary_range: '',
        job_description: '',
        status: 'wishlist',
        priority: 'medium',
        applied_date: '',
        deadline: '',
        recruiter_name: '',
        recruiter_email: '',
        recruiter_linkedin: '',
        notes: '',
        resume_version: '',
        cover_letter_used: ''
      });
    }
  }, [application, open, form]);

  const onSubmit = async (data: ApplicationFormData) => {
    const dataToSubmit = {
      company_name: data.company_name,
      job_title: data.job_title,
      status: data.status,
      priority: data.priority,
      job_url: data.job_url || null,
      location: data.location || null,
      salary_range: data.salary_range || null,
      job_description: data.job_description || null,
      applied_date: data.applied_date || null,
      deadline: data.deadline || null,
      recruiter_name: data.recruiter_name || null,
      recruiter_email: data.recruiter_email || null,
      recruiter_linkedin: data.recruiter_linkedin || null,
      notes: data.notes || null,
      resume_version: data.resume_version || null,
      cover_letter_used: data.cover_letter_used || null
    };

    if (application) {
      await updateMutation.mutateAsync({ id: application.id, updates: dataToSubmit });
    } else {
      await createMutation.mutateAsync(dataToSubmit);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application ? 'Edit Application' : 'Add New Application'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="job_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., New York, NY" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wishlist">Wishlist</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="salary_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., $80k - $100k" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low" className="cursor-pointer">Low</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high" className="cursor-pointer">High</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="applied_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applied Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
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
              name="job_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Paste the job description here..." className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="recruiter_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recruiter Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recruiter_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recruiter Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recruiter_linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recruiter LinkedIn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="LinkedIn URL" />
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
                    <Textarea {...field} placeholder="Any additional notes..." className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Application'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
