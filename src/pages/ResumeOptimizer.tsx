import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Sparkles, Upload as UploadIcon, RefreshCw, CheckCircle2, AlertCircle, Zap, TrendingUp, Target } from 'lucide-react';
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-success/10";
    if (score >= 60) return "bg-warning/10";
    return "bg-destructive/10";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Compact Hero with Icon */}
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Resume Optimizer
              </h1>
              <p className="text-base text-muted-foreground">
                AI-powered analysis to maximize your ATS compatibility and interview chances
              </p>
            </div>
          </div>

          {/* Rate Limit Banner */}
          {isRateLimited && (
            <RateLimitBanner
              remainingTime={remainingTime}
              message={rateLimitInfo?.message}
              getRemainingTimeFormatted={getRemainingTimeFormatted}
            />
          )}

          {!analysisResult ? (
            /* Input Phase - Stacked Layout */
            <div className="space-y-6">
              
              {/* Resume Input - Full Width */}
              <Card className="border-2 border-border/50 hover:border-primary/30 transition-all">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Your Resume</h3>
                        <p className="text-xs text-muted-foreground">Paste your current resume text</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Target className="h-3 w-3" />
                      Step 1
                    </Badge>
                  </div>
                  <Textarea
                    placeholder="Paste your resume content here...&#10;&#10;Include work experience, skills, education, and accomplishments."
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    className="min-h-[220px] resize-none border-border/50 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Tip: Include quantifiable achievements and relevant keywords
                  </p>
                </div>
              </Card>

              {/* Job Description Input - Full Width */}
              <Card className="border-2 border-border/50 hover:border-primary/30 transition-all">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <UploadIcon className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Target Job Description</h3>
                        <p className="text-xs text-muted-foreground">Paste the job posting you're applying to</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Target className="h-3 w-3" />
                      Step 2
                    </Badge>
                  </div>
                  <Textarea
                    placeholder="Paste the job description here...&#10;&#10;Include required skills, qualifications, and responsibilities."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[220px] resize-none border-border/50 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Pro tip: The more detailed the job description, the better the optimization
                  </p>
                </div>
              </Card>

              {/* Action Button - Centered */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!resume || !jobDescription || isAnalyzing || isRateLimited}
                  size="lg"
                  className="px-12 h-14 text-base shadow-lg hover:shadow-xl transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Your Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Optimize My Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Results Phase */
            <div className="space-y-8">
              
              {/* Score Hero Card */}
              <Card className={`border-2 ${getScoreBgColor(analysisResult.atsScore)} border-transparent shadow-xl`}>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-background shadow-inner flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${getScoreColor(analysisResult.atsScore)}`}>
                              {analysisResult.atsScore}
                            </div>
                            <div className="text-xs text-muted-foreground">ATS Score</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Analysis Complete</h2>
                        <p className="text-muted-foreground max-w-md">
                          {analysisResult.atsScore >= 80 
                            ? "Excellent! Your resume is highly optimized for ATS systems."
                            : analysisResult.atsScore >= 60 
                            ? "Good progress! A few improvements will boost your score."
                            : "Room for improvement. Follow the suggestions to enhance your resume."
                          }
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleReset} variant="outline" size="lg">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      New Analysis
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Overall Feedback */}
              <Card className="border-l-4 border-l-primary shadow-card">
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Overall Feedback</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {analysisResult.overallFeedback}
                  </p>
                </div>
              </Card>

              {/* Keyword Insights */}
              <Card className="shadow-card">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Target className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">Keyword Analysis</h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {analysisResult.keywordInsights.map((insight, index) => (
                      <Badge
                        key={index}
                        variant={
                          insight.status === 'strong' 
                            ? 'default' 
                            : insight.status === 'weak' 
                            ? 'outline' 
                            : 'secondary'
                        }
                        className={`px-4 py-2 text-sm ${
                          insight.status === 'strong' 
                            ? 'bg-success text-success-foreground' 
                            : insight.status === 'weak' 
                            ? 'border-warning text-warning-foreground' 
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {insight.status === 'strong' && <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                        {insight.status === 'weak' && <AlertCircle className="mr-1.5 h-3.5 w-3.5" />}
                        {insight.status === 'missing' && <AlertCircle className="mr-1.5 h-3.5 w-3.5" />}
                        {insight.keyword}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center p-3 rounded-lg bg-success/5">
                      <div className="text-2xl font-bold text-success">
                        {analysisResult.keywordInsights.filter(k => k.status === 'strong').length}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Strong Matches</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-warning/5">
                      <div className="text-2xl font-bold text-warning">
                        {analysisResult.keywordInsights.filter(k => k.status === 'weak').length}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Weak Matches</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-destructive/5">
                      <div className="text-2xl font-bold text-destructive">
                        {analysisResult.keywordInsights.filter(k => k.status === 'missing').length}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Missing</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Suggested Rewrites */}
              {analysisResult.suggestedRewrites.length > 0 && (
                <Card className="shadow-card">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">Suggested Improvements</h3>
                    </div>

                    <div className="space-y-6">
                      {analysisResult.suggestedRewrites.map((rewrite, index) => (
                        <div key={index} className="space-y-4 pb-6 last:pb-0 border-b last:border-0">
                          <Badge variant="outline" className="mb-2">
                            Improvement {index + 1}
                          </Badge>
                          
                          {/* Before */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <div className="h-1 w-1 rounded-full bg-destructive" />
                              Before
                            </div>
                            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {rewrite.before}
                              </p>
                            </div>
                          </div>

                          {/* After */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <div className="h-1 w-1 rounded-full bg-success" />
                              After
                            </div>
                            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                              <p className="text-sm leading-relaxed">
                                {rewrite.after}
                              </p>
                            </div>
                          </div>

                          {/* Improvements List */}
                          {rewrite.improvements.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                Why this is better:
                              </div>
                              <ul className="space-y-1.5">
                                {rewrite.improvements.map((improvement, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground">{improvement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Bottom Action */}
              <div className="flex justify-center pt-4">
                <Button onClick={handleReset} size="lg" variant="outline" className="px-8">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Analyze Another Resume
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeOptimizer;
