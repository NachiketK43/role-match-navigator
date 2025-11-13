import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Contact = {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  company: string | null;
  job_title: string | null;
  contact_type: 'recruiter' | 'employee' | 'mentor' | 'referral' | 'connection';
  relationship_strength: 'cold' | 'warm' | 'strong';
  how_we_met: string | null;
  notes: string | null;
  tags: string[] | null;
  is_active: boolean;
  last_contacted_date: string | null;
  next_followup_date: string | null;
  created_at: string;
  updated_at: string;
};

export type NewContact = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ContactUpdate = Partial<NewContact>;

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_contacts')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Contact[];
    }
  });
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('professional_contacts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Contact;
    },
    enabled: !!id
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contact: NewContact) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('professional_contacts')
        .insert({ ...contact, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact added successfully!');
    },
    onError: (error) => {
      console.error('Error creating contact:', error);
      toast.error('Failed to add contact');
    }
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ContactUpdate }) => {
      const { data, error } = await supabase
        .from('professional_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', data.id] });
      toast.success('Contact updated!');
    },
    onError: (error) => {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professional_contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted');
    },
    onError: (error) => {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  });
}
