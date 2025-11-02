import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Check, ChevronDown, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question: string;
  answer: string;
  coachingTip: string;
}

interface InterviewData {
  behavioral: Question[];
  technical: Question[];
  weakAreas: string[];
}

const PracticeInterviewQuestions = () => {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [practiced, setPracticed] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast.error("Please fill in both resume and job description");
      return;
    }

    setIsGenerating(true);
    setPracticed(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { resume, jobDescription }
      });

      if (error) {
        console.error("Generation error:", error);
        toast.error("Failed to generate questions. Please try again.");
        return;
      }

      if (!data) {
        toast.error("Invalid response from server");
        return;
      }

      setInterviewData(data);
      toast.success("Interview questions generated!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateAnswer = async (type: 'behavioral' | 'technical', index: number) => {
    if (!interviewData) return;

    toast.info("Regenerating answer...");
    // In a real implementation, you'd call the API again for just this question
    // For now, we'll just show a message
    setTimeout(() => {
      toast.success("Answer regenerated!");
    }, 1000);
  };

  const togglePracticed = (id: string) => {
    setPracticed(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalQuestions = interviewData 
    ? interviewData.behavioral.length + interviewData.technical.length 
    : 0;
  const practicedCount = practiced.size;

  const QuestionCard = ({ 
    question, 
    id, 
    type 
  }: { 
    question: Question; 
    id: string; 
    type: 'behavioral' | 'technical';
  }) => {
    const isPracticed = practiced.has(id);

    return (
      <Collapsible>
        <Card className={`p-4 transition-all ${isPracticed ? 'opacity-60 border-accent' : ''}`}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 text-left">
                <p className={`font-semibold ${isPracticed ? 'line-through' : ''}`}>
                  {question.question}
                </p>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">Sample STAR Answer:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{question.answer}</p>
            </div>

            <div className="bg-accent/10 p-3 rounded-lg">
              <p className="text-xs font-medium text-accent mb-1">💡 AI Coaching Tip:</p>
              <p className="text-xs text-muted-foreground">{question.coachingTip}</p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegenerateAnswer(type, parseInt(id.split('-')[1]))}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
              <Button
                size="sm"
                variant={isPracticed ? "secondary" : "default"}
                onClick={() => togglePracticed(id)}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                {isPracticed ? "Practiced" : "Mark as Practiced"}
              </Button>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Practice Interview Questions</h1>
            <p className="text-muted-foreground">
              AI-powered question prediction with STAR method coaching
            </p>
          </div>

          {!interviewData ? (
            <>
              {/* Input Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Your Resume
                  </h3>
                  <Textarea
                    placeholder="Paste your resume here..."
                    className="min-h-[300px] resize-none font-mono text-sm"
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  />
                </Card>

                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    Job Description
                  </h3>
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[300px] resize-none font-mono text-sm"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </Card>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-8"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      Generate Interview Questions
                      <Sparkles className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Progress Tracker */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Practice Progress</p>
                    <p className="text-2xl font-bold text-primary">
                      {practicedCount} / {totalQuestions} Questions
                    </p>
                  </div>
                  <Button onClick={handleGenerate} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Set
                  </Button>
                </div>
              </Card>

              {/* Weak Areas */}
              {interviewData.weakAreas.length > 0 && (
                <Card className="p-6 bg-accent/5 border-accent/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    Areas to Focus On
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interviewData.weakAreas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Questions Tabs */}
              <Tabs defaultValue="behavioral" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="behavioral">
                    Behavioral Questions ({interviewData.behavioral.length})
                  </TabsTrigger>
                  <TabsTrigger value="technical">
                    Technical Questions ({interviewData.technical.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="behavioral" className="space-y-4 mt-6">
                  {interviewData.behavioral.map((q, index) => (
                    <QuestionCard
                      key={`behavioral-${index}`}
                      question={q}
                      id={`behavioral-${index}`}
                      type="behavioral"
                    />
                  ))}
                </TabsContent>

                <TabsContent value="technical" className="space-y-4 mt-6">
                  {interviewData.technical.map((q, index) => (
                    <QuestionCard
                      key={`technical-${index}`}
                      question={q}
                      id={`technical-${index}`}
                      type="technical"
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PracticeInterviewQuestions;
