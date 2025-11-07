import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['job_applications']['Row'];
type NewApplication = Omit<Database['public']['Tables']['job_applications']['Insert'], 'user_id'>;
type ApplicationUpdate = Database['public']['Tables']['job_applications']['Update'];

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Application[];
    }
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (application: NewApplication) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_applications')
        .insert({ ...application, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application added successfully!');
    },
    onError: (error) => {
      console.error('Error creating application:', error);
      toast.error('Failed to add application');
    }
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ApplicationUpdate }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application updated!');
    },
    onError: (error) => {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application deleted');
    },
    onError: (error) => {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  });
}

export function useApplicationInsights() {
  return useMutation({
    mutationFn: async (application: Application) => {
      const { data: activities } = await supabase
        .from('application_activities')
        .select('*')
        .eq('application_id', application.id)
        .order('activity_date', { ascending: false })
        .limit(1);

      const lastActivity = activities?.[0]?.title || 'None';

      const { data, error } = await supabase.functions.invoke('analyze-application', {
        body: {
          companyName: application.company_name,
          jobTitle: application.job_title,
          jobDescription: application.job_description,
          currentStatus: application.status,
          appliedDate: application.applied_date,
          lastActivity
        }
      });
      
      if (error) throw error;
      return data.insights;
    },
    onError: (error) => {
      console.error('Error getting insights:', error);
      toast.error('Failed to generate insights');
    }
  });
}
