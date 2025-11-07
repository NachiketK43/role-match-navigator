import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Activity = Database['public']['Tables']['application_activities']['Row'];
type NewActivity = Omit<Database['public']['Tables']['application_activities']['Insert'], 'user_id'>;

export function useActivities(applicationId: string) {
  return useQuery({
    queryKey: ['activities', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('application_activities')
        .select('*')
        .eq('application_id', applicationId)
        .order('activity_date', { ascending: false });
      
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!applicationId
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (activity: NewActivity) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('application_activities')
        .insert({ ...activity, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data as Activity;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.application_id] });
      toast.success('Activity added!');
    },
    onError: (error) => {
      console.error('Error creating activity:', error);
      toast.error('Failed to add activity');
    }
  });
}
