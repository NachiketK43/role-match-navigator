import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

const Upload = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

      navigate("/analysis", { 
        state: { 
          analysis: data.analysis
        } 
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
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
                <UploadIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Your Resume</h3>
              </div>
              <Textarea
                placeholder="Paste your resume here..."
                className="min-h-[400px] resize-none font-mono text-sm"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include your skills, experience, and education
              </p>
            </Card>

            {/* Job Description Input */}
            <Card className="p-6 space-y-4 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-lg">Job Description</h3>
              </div>
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[400px] resize-none font-mono text-sm"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include required skills, responsibilities, and qualifications
              </p>
            </Card>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-8">
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
        </div>
      </main>
    </div>
  );
};

export default Upload;
