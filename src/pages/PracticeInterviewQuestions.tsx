import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, RefreshCw, CheckCircle2, Briefcase, Building2, FileText, Lightbulb } from 'lucide-react';
import { useRateLimitHandler } from '@/hooks/useRateLimitHandler';
import { RateLimitBanner } from '@/components/RateLimitBanner';

interface Question {
  question: string;
  answerFormat: string;
  sampleAnswer: string;
}

interface InterviewData {
  questions: Question[];
  finalNote: string;
}

const PracticeInterviewQuestions = () => {
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewData | null>(null);
  const [practicedQuestions, setPracticedQuestions] = useState<Set<number>>(new Set());
  const { handleError, isRateLimited, remainingTime, getRemainingTimeFormatted, rateLimitInfo } = useRateLimitHandler();

  const generateQuestions = async () => {
    if (!targetRole.trim() || !targetCompany.trim()) {
      toast.error('Please fill in Target Role and Target Company');
      return;
    }

    setIsGenerating(true);
    setPracticedQuestions(new Set());
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { targetRole, targetCompany, jobDescription }
      });

      if (error) {
        console.error('Interview questions generation error:', error);
        
        if (!handleError(error)) {
          toast.error('We couldn\'t load interview questions right now. Please try again.');
        }
        return;
      }

      if (!data?.questions || !data?.finalNote) {
        toast.error('Invalid response from server');
        return;
      }

      setQuestions(data);
      toast.success('Interview questions generated successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('We couldn\'t load interview questions right now. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePracticed = (questionId: number) => {
    setPracticedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };


  const handleReset = () => {
    setQuestions(null);
    setTargetRole('');
    setTargetCompany('');
    setJobDescription('');
    setPracticedQuestions(new Set());
  };

  const totalQuestions = questions ? questions.questions.length : 0;
  const progressPercentage = totalQuestions > 0 ? (practicedQuestions.size / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Practice Interview Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Generate 7 AI-tailored interview questions specific to your target company's domain. Get coached answers with recommended formats and personalized preparation tips.
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
          {!questions && (
            <Card className="p-8 shadow-card space-y-6">
              <div className="space-y-6">
                {/* Target Role and Company - Same Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="targetRole" className="flex items-center gap-2 text-base">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Target Role
                    </Label>
                    <Input
                      id="targetRole"
                      placeholder="e.g., Senior Software Engineer"
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
                      placeholder="e.g., Microsoft"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Job Description - Full Width */}
                <div className="space-y-3">
                  <Label htmlFor="jobDescription" className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    Job Description <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the complete job description here (optional - AI will infer based on role and company if not provided)..."
                    className="min-h-[250px] resize-y"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    For best results, include requirements, responsibilities, and qualifications. If omitted, questions will be based on the role and company's typical expectations.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold shadow-elevated"
                  onClick={generateQuestions}
                  disabled={isGenerating || isRateLimited}
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
            </Card>
          )}

          {/* Results Section */}
          {questions && (
            <div className="space-y-6 animate-fade-in">
              {/* Final Note Section */}
              {questions.finalNote && (
                <Card className="p-6 bg-muted/50 border-2 border-primary/20 shadow-card">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-3 flex-1">
                      <h3 className="font-semibold text-xl">Interview Preparation Tips</h3>
                      <p className="text-sm leading-relaxed">{questions.finalNote}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Progress Tracker */}
              <Card className="p-6 shadow-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Your Progress
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground">
                      {practicedQuestions.size} of {totalQuestions} Practiced
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setQuestions(null);
                    generateQuestions();
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate Questions
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="gap-2"
                >
                  Start Over
                </Button>
              </div>

              {/* Questions Section */}
              <Card className="p-8 shadow-card">
                <div className="space-y-4">
                  <h3 className="font-semibold text-xl">Interview Questions ({questions.questions.length})</h3>
                  <Accordion type="single" collapsible className="space-y-4">
                    {questions.questions.map((q, index) => {
                      const isPracticed = practicedQuestions.has(index);
                      
                      return (
                        <AccordionItem
                          key={index}
                          value={`question-${index}`}
                          className={`border-2 rounded-lg px-6 py-3 transition-all ${
                            isPracticed 
                              ? 'opacity-60 border-primary/30 bg-muted/30' 
                              : 'hover:border-primary/50 hover:shadow-md'
                          }`}
                        >
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-start gap-3 text-left w-full">
                              {isPracticed && (
                                <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                              )}
                              <div className="space-y-2 flex-1">
                                <p className={`font-semibold text-base ${isPracticed ? 'line-through' : ''}`}>
                                  {q.question}
                                </p>
                                {isPracticed && (
                                  <Badge variant="secondary" className="text-xs">
                                    ✓ Practiced
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-4">
                            <div className="space-y-4">
                              {/* Answer Format Section */}
                              <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                                <h4 className="font-semibold text-sm text-primary uppercase tracking-wide mb-2">
                                  Recommended Answer Format
                                </h4>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {q.answerFormat}
                                </p>
                              </div>

                              {/* Sample Answer Section */}
                              <div className="bg-muted/50 p-6 rounded-lg space-y-3 border border-border">
                                <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">
                                  Sample Answer
                                </h4>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                  {q.sampleAnswer}
                                </p>
                              </div>

                              <div className="flex gap-2 pt-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateQuestions()}
                                  className="gap-2"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Regenerate All Questions
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isPracticed ? "secondary" : "default"}
                                  onClick={() => togglePracticed(index)}
                                  className="gap-2"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  {isPracticed ? 'Unpractice' : 'Mark as Practiced'}
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeInterviewQuestions;
