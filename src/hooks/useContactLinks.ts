import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ContactLink = {
  id: string;
  user_id: string;
  contact_id: string;
  application_id: string;
  link_type: string;
  notes: string | null;
  created_at: string;
};

export function useContactLinks(applicationId: string | undefined) {
  return useQuery({
    queryKey: ['contact-links', applicationId],
    queryFn: async () => {
      if (!applicationId) return [];
      const { data, error } = await supabase
        .from('contact_applications_link')
        .select(`
          *,
          contact:professional_contacts(*)
        `)
        .eq('application_id', applicationId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!applicationId
  });
}

export function useCreateContactLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (link: Omit<ContactLink, 'id' | 'user_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contact_applications_link')
        .insert({ ...link, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact-links', variables.application_id] });
      toast.success('Contact linked to application!');
    },
    onError: (error: any) => {
      console.error('Error linking contact:', error);
      if (error?.code === '23505') {
        toast.error('This contact is already linked to this application');
      } else {
        toast.error('Failed to link contact');
      }
    }
  });
}

export function useDeleteContactLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, applicationId }: { id: string; applicationId: string }) => {
      const { error } = await supabase
        .from('contact_applications_link')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return applicationId;
    },
    onSuccess: (applicationId) => {
      queryClient.invalidateQueries({ queryKey: ['contact-links', applicationId] });
      toast.success('Contact unlinked');
    },
    onError: (error) => {
      console.error('Error unlinking contact:', error);
      toast.error('Failed to unlink contact');
    }
  });
}
