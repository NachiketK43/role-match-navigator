import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, FileText, Sparkles, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

interface Profile {
  email: string;
  created_at: string;
}

interface Gap {
  skill: string;
  priority: "high" | "medium" | "low";
}

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface AnalysisData {
  matchScore: number;
  strengths: string[];
  gaps: Gap[];
  recommendations: Recommendation[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, created_at')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-skill-gap', {
        body: { resume, jobDescription }
      });

      if (error) {
        console.error("Analysis error:", error);
        toast.error("Analysis failed. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      if (!data?.analysis) {
        toast.error("Invalid analysis response");
        setIsAnalyzing(false);
        return;
      }

      setAnalysisData(data.analysis);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Understand your fit.
              <span className="text-accent"> Instantly.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No guesswork. Just clear, data-backed insights on where you stand and how to grow.
            </p>
          </div>

          {/* Two Column Input */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resume Input */}
            <Card className="p-6 space-y-4 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Your Resume</h3>
              </div>
              <Textarea
                placeholder="Paste your resume here..."
                className="min-h-[400px] resize-none font-mono text-sm"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </Card>

            {/* Job Description Input */}
            <Card className="p-6 space-y-4 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-lg">Job Description</h3>
              </div>
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[400px] resize-none font-mono text-sm"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </Card>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary-glow shadow-elevated hover:shadow-accent transition-all"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze My Fit
                  <Sparkles className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Analysis Results */}
          {analysisData && (
            <div className="space-y-8 pt-8 border-t">
              {/* Match Score */}
              <Card className="p-8 shadow-elevated bg-gradient-primary text-primary-foreground">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium opacity-90">Your Skill Match Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold">{analysisData.matchScore}%</span>
                      <span className="text-lg opacity-75">fit</span>
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <Progress 
                      value={analysisData.matchScore} 
                      className="h-3 bg-primary-foreground/20"
                    />
                    <p className="text-sm mt-2 opacity-75">
                      You're closer than you think
                    </p>
                  </div>
                </div>
              </Card>

              {/* Top Strengths */}
              <Card className="p-8 shadow-card space-y-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <h2 className="text-2xl font-semibold">Your Top Strengths</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {analysisData.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-success/5 border border-success/20"
                    >
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{strength}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Missing Skills */}
              <Card className="p-8 shadow-card space-y-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-warning" />
                  <h2 className="text-2xl font-semibold">Growth Areas</h2>
                </div>
                <div className="space-y-3">
                  {analysisData.gaps.map((gap, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20 hover:border-warning/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
                        <span className="font-medium">{gap.skill}</span>
                      </div>
                      <Badge 
                        variant={gap.priority === "high" ? "default" : "secondary"}
                        className={gap.priority === "high" ? "bg-warning text-warning-foreground" : ""}
                      >
                        {gap.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommended Learning Path */}
              <Card className="p-8 shadow-card space-y-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-info" />
                  <h2 className="text-2xl font-semibold">Suggested Learning Path</h2>
                </div>
                <div className="space-y-4">
                  {analysisData.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-lg border border-border hover:border-accent/50 hover:shadow-card transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                        <Badge 
                          variant={rec.priority === "high" ? "default" : "secondary"}
                          className={rec.priority === "high" ? "bg-info text-info-foreground" : ""}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Run Another Analysis */}
              <div className="text-center pt-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setAnalysisData(null);
                    setResume("");
                    setJobDescription("");
                  }}
                  className="gap-2"
                >
                  Run Another Analysis
                  <Sparkles className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
