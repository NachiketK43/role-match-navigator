import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2, AlertCircle, ArrowLeft, BookOpen } from "lucide-react";

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

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const analysisData = location.state?.analysis as AnalysisData;

  if (!analysisData) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              <h1 className="text-xl font-semibold">SkillLens</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero - Match Score */}
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

          {/* Bottom CTA */}
          <div className="text-center pt-8">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              Run Another Analysis
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
