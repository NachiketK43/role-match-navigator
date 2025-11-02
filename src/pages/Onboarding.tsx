import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface OnboardingData {
  full_name: string;
  email: string;
  role: string;
  years_of_experience: string;
  company: string;
  career_goals: string;
  linkedin_url: string;
  portfolio_url: string;
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    full_name: "",
    email: user?.email || "",
    role: "",
    years_of_experience: "",
    company: "",
    career_goals: "",
    linkedin_url: "",
    portfolio_url: "",
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

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

      // If profile already has required fields, redirect to dashboard
      if (data?.full_name && data?.role && data?.years_of_experience) {
        navigate("/dashboard");
        return;
      }

      setFormData({
        full_name: data?.full_name || "",
        email: data?.email || user?.email || "",
        role: data?.role || "",
        years_of_experience: data?.years_of_experience || "",
        company: data?.company || "",
        career_goals: data?.career_goals || "",
        linkedin_url: data?.linkedin_url || "",
        portfolio_url: data?.portfolio_url || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Info
        if (!formData.full_name.trim()) {
          toast.error("Please enter your full name");
          return false;
        }
        return true;
      case 2: // Career Info
        if (!formData.role.trim()) {
          toast.error("Please enter your role");
          return false;
        }
        if (!formData.years_of_experience) {
          toast.error("Please select your years of experience");
          return false;
        }
        return true;
      case 3: // Goals & Links - all optional
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          role: formData.role,
          years_of_experience: formData.years_of_experience,
          company: formData.company,
          career_goals: formData.career_goals,
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Profile completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                This email is linked to your account
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_of_experience">
                Years of Experience <span className="text-destructive">*</span>
              </Label>
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

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g., Microsoft"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="career_goals">Career Goals</Label>
              <Textarea
                id="career_goals"
                placeholder="Describe your career aspirations and goals..."
                value={formData.career_goals}
                onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                placeholder="https://yourportfolio.com"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information";
      case 2:
        return "Career Information";
      case 3:
        return "Goals & Links";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Let's start with your basic information";
      case 2:
        return "Tell us about your professional background";
      case 3:
        return "Share your aspirations and online presence";
      default:
        return "";
    }
  };

  const isStepOptional = currentStep === 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || saving}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <div className="flex gap-2">
                {isStepOptional && currentStep < totalSteps && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={saving}
                  >
                    Skip this step
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === totalSteps ? (
                    "Complete"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
