import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Sparkles, Upload as UploadIcon, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRateLimitHandler } from '@/hooks/useRateLimitHandler';
import { RateLimitBanner } from '@/components/RateLimitBanner';

interface KeywordInsight {
  keyword: string;
  status: 'missing' | 'weak' | 'strong';
}

interface BeforeAfter {
  before: string;
  after: string;
  improvements: string[];
}

interface AnalysisResult {
  atsScore: number;
  keywordInsights: KeywordInsight[];
  suggestedRewrites: BeforeAfter[];
  overallFeedback: string;
}

const ResumeOptimizer = () => {
  const { user } = useAuth();
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { handleError, isRateLimited, remainingTime, getRemainingTimeFormatted, rateLimitInfo } = useRateLimitHandler();

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast.error("Please provide both resume and job description");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('optimize-resume', {
        body: { resume, jobDescription }
      });

      if (error) {
        console.error("Optimization error:", error);
        
        if (!handleError(error)) {
          toast.error("Analysis failed. Please try again.");
        }
        setIsAnalyzing(false);
        return;
      }

      if (!data?.result) {
        toast.error("Invalid analysis response");
        setIsAnalyzing(false);
        return;
      }

      setAnalysisResult(data.result);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setResume("");
    setJobDescription("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#343434]">
              Resume Optimizer
            </h1>
            <p className="text-lg text-muted-foreground">
              Actionable insights and rewrites with ATS feedback to boost your hiring chances.
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
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Resume Input */}
            <Card className="p-6 space-y-4 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Your Resume</h3>
              </div>
              <Textarea
                placeholder="Upload or paste your resume below..."
                className="min-h-[400px] resize-none font-mono text-sm"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Paste your resume text or key sections here</p>
            </Card>

            {/* Job Description Input */}
            <Card className="p-6 space-y-4 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5 text-[hsl(45,97%,54%)]" />
                <h3 className="font-semibold text-lg">Target Job Description</h3>
              </div>
              <Textarea
                placeholder="Paste your job description here..."
                className="min-h-[400px] resize-none font-mono text-sm"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Include the full job posting for best results</p>
            </Card>
          </div>

          {/* CTA */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary-glow shadow-elevated transition-all"
              onClick={handleAnalyze}
              disabled={isAnalyzing || isRateLimited}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Optimize Resume
                  <Sparkles className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            {analysisResult && (
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold"
                onClick={handleReset}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Start Over
              </Button>
            )}
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-8 pt-8 border-t animate-fade-in">
              {/* ATS Score */}
              <Card className="p-8 shadow-elevated bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium opacity-90">ATS Compatibility Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold">{analysisResult.atsScore}%</span>
                      <span className="text-lg opacity-75">
                        {analysisResult.atsScore >= 80 ? 'Excellent' : analysisResult.atsScore >= 60 ? 'Good' : 'Needs Work'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <Progress 
                      value={analysisResult.atsScore} 
                      className="h-3 bg-primary-foreground/20"
                    />
                    <p className="text-sm mt-2 opacity-75">
                      Based on keyword density and structure
                    </p>
                  </div>
                </div>
              </Card>

              {/* Overall Feedback */}
              <Card className="p-8 shadow-card">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-[hsl(45,97%,54%)]" />
                  Overall Analysis
                </h2>
                <p className="text-muted-foreground leading-relaxed">{analysisResult.overallFeedback}</p>
              </Card>

              {/* Keyword Insights */}
              <Card className="p-8 shadow-card space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-[hsl(45,97%,54%)]" />
                  Keyword Insights
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {analysisResult.keywordInsights.map((insight, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        insight.status === 'missing' 
                          ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/40' 
                          : insight.status === 'weak'
                          ? 'bg-warning/5 border-warning/20 hover:border-warning/40'
                          : 'bg-success/5 border-success/20'
                      }`}
                    >
                      <span className="font-medium">{insight.keyword}</span>
                      <Badge 
                        variant={insight.status === 'strong' ? 'default' : 'secondary'}
                        className={
                          insight.status === 'missing' 
                            ? 'bg-destructive text-destructive-foreground' 
                            : insight.status === 'weak'
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-success text-success-foreground'
                        }
                      >
                        {insight.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Before/After Rewrites */}
              <Card className="p-8 shadow-card space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  Suggested Rewrites
                </h2>
                <div className="space-y-6">
                  {analysisResult.suggestedRewrites.map((rewrite, index) => (
                    <div key={index} className="space-y-4 p-6 rounded-lg border border-border bg-muted/30">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Before</p>
                        <p className="text-base leading-relaxed p-4 bg-card rounded border border-border/50">
                          {rewrite.before}
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-success uppercase tracking-wide">After</p>
                        <p className="text-base leading-relaxed p-4 bg-success/5 rounded border border-success/20">
                          {rewrite.after}
                        </p>
                      </div>
                      {rewrite.improvements.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <p className="text-sm font-semibold text-[hsl(45,97%,54%)]">Improvements:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {rewrite.improvements.map((improvement, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[hsl(45,97%,54%)] mt-1">•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeOptimizer;
