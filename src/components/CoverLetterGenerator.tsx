import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Copy, RefreshCw, Download, Sparkles } from 'lucide-react';

interface CoverLetters {
  conservative: string;
  passionate: string;
  dataDriven: string;
}

interface CoverLetterGeneratorProps {
  resume: string;
  jobDescription: string;
  analysisResult: any;
}

export const CoverLetterGenerator = ({ resume, jobDescription, analysisResult }: CoverLetterGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetters, setCoverLetters] = useState<CoverLetters | null>(null);

  const generateCoverLetters = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: { resume, jobDescription, analysisResult }
      });

      if (error) {
        console.error('Cover letter generation error:', error);
        toast.error('Failed to generate cover letters. Please try again.');
        return;
      }

      if (!data?.coverLetters) {
        toast.error('Invalid response from cover letter service');
        return;
      }

      setCoverLetters(data.coverLetters);
      toast.success('Cover letters generated successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, tone: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${tone} cover letter copied to clipboard!`);
  };

  const downloadAllAsText = () => {
    if (!coverLetters) return;

    const content = `CONSERVATIVE TONE\n${'='.repeat(80)}\n\n${coverLetters.conservative}\n\n\n` +
                   `PASSIONATE TONE\n${'='.repeat(80)}\n\n${coverLetters.passionate}\n\n\n` +
                   `DATA-DRIVEN TONE\n${'='.repeat(80)}\n\n${coverLetters.dataDriven}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letters.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Cover letters downloaded!');
  };

  const tones = [
    { key: 'conservative', label: 'Conservative', description: 'Professional and formal' },
    { key: 'passionate', label: 'Passionate', description: 'Enthusiastic and engaging' },
    { key: 'dataDriven', label: 'Data-Driven', description: 'Metrics-focused' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {!coverLetters ? (
        <Card className="p-8 shadow-card text-center space-y-4">
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold">Generate Your Cover Letter</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Create personalized cover letters in three different tones based on your resume and the job description.
          </p>
          <Button
            size="lg"
            onClick={generateCoverLetters}
            disabled={isGenerating}
            className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary-glow shadow-elevated transition-all"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Cover Letter
                <Sparkles className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-8 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Suggested Cover Letters
                </h3>
                <p className="text-muted-foreground mt-1">Choose the tone that best fits your style</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={downloadAllAsText}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCoverLetters(null);
                    generateCoverLetters();
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {tones.map(({ key, label, description }) => (
                <AccordionItem
                  key={key}
                  value={key}
                  className="border rounded-lg px-6 py-2 hover:border-primary/50 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-sm">
                        {label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{description}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none p-6 bg-muted/30 rounded-lg border border-border">
                        <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                          {coverLetters[key as keyof CoverLetters]}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(coverLetters[key as keyof CoverLetters], label)}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Letter
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      )}
    </div>
  );
};
