import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

interface ProfileData {
  full_name: string;
  email: string;
  role: string;
  company: string;
  years_of_experience: string;
  career_goals: string;
  linkedin_url: string;
  portfolio_url: string;
  profile_picture_url: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [originalData, setOriginalData] = useState<ProfileData>({
    full_name: "",
    email: "",
    role: "",
    company: "",
    years_of_experience: "",
    career_goals: "",
    linkedin_url: "",
    portfolio_url: "",
    profile_picture_url: "",
  });

  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    email: "",
    role: "",
    company: "",
    years_of_experience: "",
    career_goals: "",
    linkedin_url: "",
    portfolio_url: "",
    profile_picture_url: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    // Check if any field has changed
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      const profileData: ProfileData = {
        full_name: data?.full_name || "",
        email: data?.email || "",
        role: data?.role || "",
        company: data?.company || "",
        years_of_experience: data?.years_of_experience?.toString() || "",
        career_goals: data?.career_goals || "",
        linkedin_url: data?.linkedin_url || "",
        portfolio_url: data?.portfolio_url || "",
        profile_picture_url: data?.profile_picture_url || "",
      };

      setFormData(profileData);
      setOriginalData(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          role: formData.role,
          company: formData.company,
          years_of_experience: formData.years_of_experience,
          career_goals: formData.career_goals,
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
          profile_picture_url: formData.profile_picture_url,
        })
        .eq("id", user?.id);

      if (error) throw error;

      setOriginalData(formData);
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
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.profile_picture_url} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {formData.full_name ? getInitials(formData.full_name) : <User />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                <Input
                  id="profile_picture_url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.profile_picture_url}
                  onChange={(e) =>
                    setFormData({ ...formData, profile_picture_url: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={formData.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed from this page
              </p>
            </div>

            {/* Role and Years of Experience - Same Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="e.g., Software Engineer"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Select
                  value={formData.years_of_experience}
                  onValueChange={(value) =>
                    setFormData({ ...formData, years_of_experience: value })
                  }
                >
                  <SelectTrigger id="years_of_experience">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3 years">0-3 years</SelectItem>
                    <SelectItem value="3-6 years">3-6 years</SelectItem>
                    <SelectItem value="6-10 years">6-10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g., Microsoft"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            {/* Career Goals */}
            <div className="space-y-2">
              <Label htmlFor="career_goals">Career Goals</Label>
              <Textarea
                id="career_goals"
                placeholder="Describe your career aspirations and goals..."
                value={formData.career_goals}
                onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                rows={4}
              />
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                placeholder="https://yourportfolio.com"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
