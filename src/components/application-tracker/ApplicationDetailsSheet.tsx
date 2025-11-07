import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Edit, Trash2, ExternalLink, Mail, Linkedin, MapPin, DollarSign, FileText, Plus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ActivityTimeline } from './ActivityTimeline';
import { useState } from 'react';
import { useActivities, useCreateActivity } from '@/hooks/useActivities';
import { useApplicationInsights, useDeleteApplication } from '@/hooks/useApplications';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Application = Database['public']['Tables']['job_applications']['Row'];
type ActivityType = Database['public']['Enums']['activity_type'];

interface ApplicationDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onEdit: (application: Application) => void;
}

export function ApplicationDetailsSheet({ open, onOpenChange, application, onEdit }: ApplicationDetailsSheetProps) {
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  
  const { data: activities = [] } = useActivities(application?.id || '');
  const createActivityMutation = useCreateActivity();
  const getInsightsMutation = useApplicationInsights();
  const deleteMutation = useDeleteApplication();

  const [activityForm, setActivityForm] = useState({
    activity_type: 'note' as ActivityType,
    title: '',
    description: ''
  });

  if (!application) return null;

  const handleGetInsights = async () => {
    const result = await getInsightsMutation.mutateAsync(application);
    setInsights(result);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    await createActivityMutation.mutateAsync({
      application_id: application.id,
      ...activityForm
    });
    setShowAddActivity(false);
    setActivityForm({ activity_type: 'note', title: '', description: '' });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(application.id);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">
              {application.company_name} - {application.job_title}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={application.status} />
              {application.priority === 'high' && (
                <Badge variant="destructive">High Priority</Badge>
              )}
              {application.priority === 'medium' && (
                <Badge variant="outline">Medium Priority</Badge>
              )}
            </div>

            {/* Key Details */}
            <Card className="p-4 space-y-3">
              {application.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{application.location}</span>
                </div>
              )}
              {application.salary_range && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{application.salary_range}</span>
                </div>
              )}
              {application.applied_date && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Applied on {new Date(application.applied_date).toLocaleDateString()}</span>
                </div>
              )}
              {application.job_url && (
                <a 
                  href={application.job_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Job Posting
                </a>
              )}
            </Card>

            {/* Contact Info */}
            {(application.recruiter_name || application.recruiter_email || application.recruiter_linkedin) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {application.recruiter_name && (
                      <p className="text-sm">{application.recruiter_name}</p>
                    )}
                    {application.recruiter_email && (
                      <a href={`mailto:${application.recruiter_email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Mail className="h-4 w-4" />
                        {application.recruiter_email}
                      </a>
                    )}
                    {application.recruiter_linkedin && (
                      <a href={application.recruiter_linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* AI Insights */}
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Insights
                </h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleGetInsights}
                  disabled={getInsightsMutation.isPending}
                >
                  {getInsightsMutation.isPending ? 'Analyzing...' : 'Get Insights'}
                </Button>
              </div>
              {insights && (
                <Card className="p-4 space-y-3 bg-primary/5">
                  <div>
                    <p className="text-sm font-medium">Next Action:</p>
                    <p className="text-sm text-muted-foreground">{insights.nextAction}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Follow-up Timing:</p>
                    <p className="text-sm text-muted-foreground">{insights.followUpTiming}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Preparation Points:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {insights.preparationPoints.map((point: string, index: number) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  {insights.concerns && insights.concerns.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-destructive">Concerns:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {insights.concerns.map((concern: string, index: number) => (
                          <li key={index}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Estimated Timeline:</p>
                    <p className="text-sm text-muted-foreground">{insights.estimatedTimeline}</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Activity Timeline */}
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Activity Timeline</h3>
                <Button size="sm" variant="outline" onClick={() => setShowAddActivity(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </div>
              <ActivityTimeline activities={activities} />
            </div>

            {/* Notes */}
            {application.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.notes}</p>
                </div>
              </>
            )}

            {/* Actions */}
            <Separator />
            <div className="flex gap-3">
              <Button onClick={() => onEdit(application)} className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit Application
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Activity Dialog */}
      <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity_type">Activity Type</Label>
              <Select 
                value={activityForm.activity_type} 
                onValueChange={(value: ActivityType) => setActivityForm({ ...activityForm, activity_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="status_change">Status Change</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="follow_up_sent">Follow-up Sent</SelectItem>
                  <SelectItem value="response_received">Response Received</SelectItem>
                  <SelectItem value="document_submitted">Document Submitted</SelectItem>
                  <SelectItem value="offer_received">Offer Received</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddActivity(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending ? 'Adding...' : 'Add Activity'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this application and all associated activities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
