import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateApplication, useUpdateApplication } from '@/hooks/useApplications';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['job_applications']['Row'];
type ApplicationStatus = Database['public']['Enums']['application_status'];
type ApplicationPriority = Database['public']['Enums']['application_priority'];

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: Application | null;
}

export function ApplicationDialog({ open, onOpenChange, application }: ApplicationDialogProps) {
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();

  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    location: '',
    salary_range: '',
    job_description: '',
    status: 'wishlist' as ApplicationStatus,
    priority: 'medium' as ApplicationPriority,
    applied_date: '',
    deadline: '',
    recruiter_name: '',
    recruiter_email: '',
    recruiter_linkedin: '',
    notes: '',
    resume_version: '',
    cover_letter_used: ''
  });

  useEffect(() => {
    if (application) {
      setFormData({
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
      setFormData({
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
  }, [application, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      job_url: formData.job_url || null,
      location: formData.location || null,
      salary_range: formData.salary_range || null,
      job_description: formData.job_description || null,
      applied_date: formData.applied_date || null,
      deadline: formData.deadline || null,
      recruiter_name: formData.recruiter_name || null,
      recruiter_email: formData.recruiter_email || null,
      recruiter_linkedin: formData.recruiter_linkedin || null,
      notes: formData.notes || null,
      resume_version: formData.resume_version || null,
      cover_letter_used: formData.cover_letter_used || null
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_url">Job URL</Label>
              <Input
                id="job_url"
                type="url"
                placeholder="https://..."
                value={formData.job_url}
                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, NY"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: ApplicationStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                placeholder="e.g., $80k - $100k"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup value={formData.priority} onValueChange={(value: ApplicationPriority) => setFormData({ ...formData, priority: value })}>
              <div className="flex gap-4">
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
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applied_date">Applied Date</Label>
              <Input
                id="applied_date"
                type="date"
                value={formData.applied_date}
                onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              placeholder="Paste the job description here..."
              className="min-h-[100px]"
              value={formData.job_description}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recruiter_name">Recruiter Name</Label>
              <Input
                id="recruiter_name"
                value={formData.recruiter_name}
                onChange={(e) => setFormData({ ...formData, recruiter_name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recruiter_email">Recruiter Email</Label>
              <Input
                id="recruiter_email"
                type="email"
                value={formData.recruiter_email}
                onChange={(e) => setFormData({ ...formData, recruiter_email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recruiter_linkedin">Recruiter LinkedIn</Label>
              <Input
                id="recruiter_linkedin"
                placeholder="LinkedIn URL"
                value={formData.recruiter_linkedin}
                onChange={(e) => setFormData({ ...formData, recruiter_linkedin: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              className="min-h-[100px]"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
