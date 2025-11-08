import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Copy, Sparkles, Briefcase, Building2 } from 'lucide-react';
import { useRateLimitHandler } from '@/hooks/useRateLimitHandler';
import { RateLimitBanner } from '@/components/RateLimitBanner';

type Template = 'professional' | 'passionate' | 'data-driven' | 'creative';

interface TemplateOption {
  id: Template;
  label: string;
  description: string;
}

const CoverLetterGenerator = () => {
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const { handleError, isRateLimited, remainingTime, getRemainingTimeFormatted, rateLimitInfo } = useRateLimitHandler();

  const templates: TemplateOption[] = [
    { id: 'professional', label: 'Professional', description: 'Formal and traditional business tone' },
    { id: 'passionate', label: 'Passionate', description: 'Enthusiastic and engaging' },
    { id: 'data-driven', label: 'Data-Driven', description: 'Metrics-focused and achievement-oriented' },
    { id: 'creative', label: 'Creative', description: 'Unique and innovative approach' }
  ];

  const generateCoverLetter = async () => {
    if (!targetRole.trim() || !targetCompany.trim() || !jobDescription.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: { 
          targetRole, 
          targetCompany, 
          jobDescription, 
          template: selectedTemplate 
        }
      });

      if (error) {
        console.error('Cover letter generation error:', error);
        
        if (!handleError(error)) {
          toast.error('Failed to generate cover letter. Please try again.');
        }
        return;
      }

      if (!data?.coverLetter) {
        toast.error('Invalid response from cover letter service');
        return;
      }

      setGeneratedLetter(data.coverLetter);
      toast.success('Cover letter generated successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    toast.success('Cover letter copied to clipboard!');
  };

  const handleReset = () => {
    setGeneratedLetter(null);
    setTargetRole('');
    setTargetCompany('');
    setJobDescription('');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Cover Letter Generator
            </h1>
            <p className="text-lg text-muted-foreground">
              Create a personalized cover letter tailored to your target role and company.
            </p>
          </div>

          {/* Rate Limit Banner */}
          {isRateLimited && (
            <RateLimitBanner
              remainingTime={remainingTime}
              message={rateLimitInfo?.message}
              getRemainingTimeFormatted={getRemainingTimeFormatted}
            />
          )}

          {/* Input Section */}
          {!generatedLetter && (
            <Card className="p-8 shadow-card space-y-8">
              {/* Template Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select Template Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">{template.label}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="targetRole" className="flex items-center gap-2 text-base">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Target Role
                  </Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Senior Product Manager"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="targetCompany" className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-primary" />
                    Target Company
                  </Label>
                  <Input
                    id="targetCompany"
                    placeholder="e.g., Google"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="jobDescription" className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    Job Description
                  </Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the full job description here..."
                    className="min-h-[250px] resize-y"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include the complete job posting for best results
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold shadow-elevated"
                  onClick={generateCoverLetter}
                  disabled={isGenerating || isRateLimited}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Generating Your Cover Letter...
                    </>
                  ) : (
                    <>
                      Generate My Cover Letter
                      <Sparkles className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Results Section */}
          {generatedLetter && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-8 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Your Cover Letter
                  </h3>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                  >
                    Start Over
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="prose prose-sm max-w-none p-8 bg-muted/30 rounded-lg border border-border">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {generatedLetter}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={copyToClipboard}
                      className="gap-2 shadow-elevated"
                    >
                      <Copy className="h-5 w-5" />
                      Copy Cover Letter
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
