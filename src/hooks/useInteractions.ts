import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Interaction = {
  id: string;
  user_id: string;
  contact_id: string;
  interaction_type: string;
  interaction_date: string;
  title: string;
  notes: string | null;
  requires_followup: boolean;
  followup_date: string | null;
  is_completed: boolean;
  created_at: string;
};

export type NewInteraction = Omit<Interaction, 'id' | 'user_id' | 'created_at'>;

export function useInteractions(contactId: string | undefined) {
  return useQuery({
    queryKey: ['interactions', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const { data, error } = await supabase
        .from('contact_interactions')
        .select('*')
        .eq('contact_id', contactId)
        .order('interaction_date', { ascending: false });
      
      if (error) throw error;
      return data as Interaction[];
    },
    enabled: !!contactId
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (interaction: NewInteraction) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contact_interactions')
        .insert({ ...interaction, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;

      // Update last_contacted_date on the contact
      await supabase
        .from('professional_contacts')
        .update({ last_contacted_date: interaction.interaction_date })
        .eq('id', interaction.contact_id);

      return data as Interaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interactions', variables.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.contact_id] });
      toast.success('Interaction logged!');
    },
    onError: (error) => {
      console.error('Error creating interaction:', error);
      toast.error('Failed to log interaction');
    }
  });
}

export function useUpdateInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Interaction> }) => {
      const { data, error } = await supabase
        .from('contact_interactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Interaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interactions', data.contact_id] });
      toast.success('Interaction updated!');
    },
    onError: (error) => {
      console.error('Error updating interaction:', error);
      toast.error('Failed to update interaction');
    }
  });
}

export function useDeleteInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, contactId }: { id: string; contactId: string }) => {
      const { error } = await supabase
        .from('contact_interactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return contactId;
    },
    onSuccess: (contactId) => {
      queryClient.invalidateQueries({ queryKey: ['interactions', contactId] });
      toast.success('Interaction deleted');
    },
    onError: (error) => {
      console.error('Error deleting interaction:', error);
      toast.error('Failed to delete interaction');
    }
  });
}
