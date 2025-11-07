import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200, 'Name too long'),
  email: z.string().email('Invalid email address'),
  role: z.string().trim().max(200, 'Role must be less than 200 characters').optional().or(z.literal('')),
  company: z.string().trim().max(200, 'Company name must be less than 200 characters').optional().or(z.literal('')),
  years_of_experience: z.string().optional(),
  career_goals: z.string().trim().max(5000, 'Career goals too long (max 5,000 characters)').optional().or(z.literal('')),
  linkedin_url: z.string().trim().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolio_url: z.string().trim().url('Invalid portfolio URL').optional().or(z.literal('')),
  profile_picture_url: z.string().trim().url('Invalid image URL').optional().or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role: "",
      company: "",
      years_of_experience: "",
      career_goals: "",
      linkedin_url: "",
      portfolio_url: "",
      profile_picture_url: "",
    }
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      form.reset({
        full_name: data?.full_name || "",
        email: data?.email || "",
        role: data?.role || "",
        company: data?.company || "",
        years_of_experience: data?.years_of_experience?.toString() || "",
        career_goals: data?.career_goals || "",
        linkedin_url: data?.linkedin_url || "",
        portfolio_url: data?.portfolio_url || "",
        profile_picture_url: data?.profile_picture_url || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          role: data.role || null,
          company: data.company || null,
          years_of_experience: data.years_of_experience || null,
          career_goals: data.career_goals || null,
          linkedin_url: data.linkedin_url || null,
          portfolio_url: data.portfolio_url || null,
          profile_picture_url: data.profile_picture_url || null,
        })
        .eq("id", user?.id);

      if (error) throw error;

      form.reset(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and career details
          </p>
        </div>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={form.watch('profile_picture_url')} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {form.watch('full_name') ? getInitials(form.watch('full_name')) : <User />}
                    </AvatarFallback>
                  </Avatar>
                  <FormField
                    control={form.control}
                    name="profile_picture_url"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Profile Picture URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/avatar.jpg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email (Read-only) */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                      <FormDescription>
                        Email cannot be changed from this page
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Role and Years of Experience - Same Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Software Engineer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="years_of_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-3 years">0-3 years</SelectItem>
                            <SelectItem value="3-6 years">3-6 years</SelectItem>
                            <SelectItem value="6-10 years">6-10 years</SelectItem>
                            <SelectItem value="10+ years">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Company */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Microsoft" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Career Goals */}
                <FormField
                  control={form.control}
                  name="career_goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Career Goals</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe your career aspirations and goals..." rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* LinkedIn URL */}
                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://linkedin.com/in/yourprofile" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Portfolio URL */}
                <FormField
                  control={form.control}
                  name="portfolio_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://yourportfolio.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Save Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={!form.formState.isDirty || saving}
                    className="w-full md:w-auto"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
