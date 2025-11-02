import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Target, Upload as UploadIcon } from 'lucide-react';

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
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [practicedQuestions, setPracticedQuestions] = useState<Set<string>>(new Set());

  const generateQuestions = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast.error('Please provide both resume and job description');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { resume, jobDescription, skillGaps: null }
      });

      if (error) {
        console.error('Question generation error:', error);
        toast.error('Failed to generate questions. Please try again.');
        return;
      }

      if (!data?.interviewData) {
        toast.error('Invalid response from question service');
        return;
      }

      setInterviewData(data.interviewData);
      setPracticedQuestions(new Set());
      toast.success('Interview questions generated successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateAnswer = async (type: 'behavioral' | 'technical', index: number) => {
    toast.info('Regenerating answer...');
    await generateQuestions();
  };

  const markAsPracticed = (questionKey: string) => {
    setPracticedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionKey)) {
        newSet.delete(questionKey);
      } else {
        newSet.add(questionKey);
      }
      return newSet;
    });
    toast.success('Question marked!');
  };

  const handleReset = () => {
    setInterviewData(null);
    setResume('');
    setJobDescription('');
    setPracticedQuestions(new Set());
  };

  const totalQuestions = interviewData 
    ? (interviewData.behavioral?.length || 0) + (interviewData.technical?.length || 0)
    : 0;
  const practiceProgress = totalQuestions > 0 
    ? (practicedQuestions.size / totalQuestions) * 100 
    : 0;

  const renderQuestions = (questions: Question[], type: 'behavioral' | 'technical') => {
    return (
      <Accordion type="single" collapsible className="space-y-4">
        {questions.map((q, index) => {
          const questionKey = `${type}-${index}`;
          const isPracticed = practicedQuestions.has(questionKey);
          
          return (
            <AccordionItem
              key={questionKey}
              value={questionKey}
              className={`border rounded-lg px-6 py-2 transition-all ${
                isPracticed 
                  ? 'bg-success/5 border-success/30 opacity-75' 
                  : 'hover:border-primary/50'
              }`}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  {isPracticed && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
                  <span className={`text-left ${isPracticed ? 'line-through' : ''}`}>
                    {q.question}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  {/* STAR Answer */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Sample Answer (STAR Method)
                    </h4>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                    </div>
                  </div>

                  {/* Coaching Tip */}
                  <div className="p-3 bg-[hsl(45,97%,54%)]/10 border border-[hsl(45,97%,54%)]/20 rounded-lg">
                    <p className="text-sm flex items-start gap-2">
                      <Target className="h-4 w-4 text-[hsl(45,97%,54%)] mt-0.5 flex-shrink-0" />
                      <span><strong>AI Tip:</strong> {q.coachingTip}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateAnswer(type, index)}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate Answer
                    </Button>
                    <Button
                      variant={isPracticed ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => markAsPracticed(questionKey)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isPracticed ? 'Mark as Unpracticed' : 'Mark as Practiced'}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#343434]">
              Practice Interview Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get predicted interview questions with AI-coached STAR method answers.
            </p>
          </div>

          {/* Input Section */}
          {!interviewData && (
            <>
              <div className="grid lg:grid-cols-2 gap-6">
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
                  <p className="text-xs text-muted-foreground">Paste your resume text or key sections here</p>
                </Card>

                {/* Job Description Input */}
                <Card className="p-6 space-y-4 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex items-center gap-2">
                    <UploadIcon className="h-5 w-5 text-[hsl(45,97%,54%)]" />
                    <h3 className="font-semibold text-lg">Target Job Description</h3>
                  </div>
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[400px] resize-none font-mono text-sm"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Include the full job posting for best results</p>
                </Card>
              </div>

              {/* CTA */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary-glow shadow-elevated transition-all"
                  onClick={generateQuestions}
                  disabled={isGenerating}
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
          )}

          {/* Results Section */}
          {interviewData && (
            <div className="space-y-6 animate-fade-in">
              {/* Progress Tracker */}
              <Card className="p-6 shadow-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Practice Progress</h3>
                    <span className="text-sm text-muted-foreground">
                      {practicedQuestions.size} of {totalQuestions} questions practiced
                    </span>
                  </div>
                  <Progress value={practiceProgress} className="h-2" />
                </div>
              </Card>

              {/* Weak Areas */}
              {interviewData.weakAreas && interviewData.weakAreas.length > 0 && (
                <Card className="p-6 shadow-card bg-warning/5 border-warning/20">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      Areas to Focus On
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {interviewData.weakAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="bg-warning/10 text-warning-foreground">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Questions Tabs */}
              <Card className="p-6 shadow-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-semibold">Predicted Interview Questions</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={generateQuestions}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Generate New Set
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="gap-2"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="behavioral" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="behavioral">
                      Behavioral Questions ({interviewData.behavioral?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="technical">
                      Technical Questions ({interviewData.technical?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="behavioral" className="space-y-4">
                    {interviewData.behavioral && interviewData.behavioral.length > 0 ? (
                      renderQuestions(interviewData.behavioral, 'behavioral')
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No behavioral questions generated</p>
                    )}
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4">
                    {interviewData.technical && interviewData.technical.length > 0 ? (
                      renderQuestions(interviewData.technical, 'technical')
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No technical questions generated</p>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeInterviewQuestions;
