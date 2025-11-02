import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, RefreshCw, CheckCircle2, Briefcase, Building2, FileText, Lightbulb } from 'lucide-react';

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
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewData | null>(null);
  const [practicedQuestions, setPracticedQuestions] = useState<Set<number>>(new Set());

  const generateQuestions = async () => {
    if (!targetRole.trim() || !targetCompany.trim() || !jobDescription.trim()) {
      toast.error('Please fill in all fields');
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
        toast.error('We couldn\'t load interview questions right now. Please try again.');
        return;
      }

      if (!data?.behavioral || !data?.technical) {
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

  const regenerateAnswer = async (index: number, type: 'behavioral' | 'technical') => {
    toast.info('Regenerating answer...');
    await generateQuestions();
  };

  const handleReset = () => {
    setQuestions(null);
    setTargetRole('');
    setTargetCompany('');
    setJobDescription('');
    setPracticedQuestions(new Set());
  };

  const totalQuestions = questions ? questions.behavioral.length + questions.technical.length : 0;
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
              Generate and practice AI-predicted interview questions tailored to your target role. Get coached answers using the STAR method and identify weak areas to focus on.
            </p>
          </div>

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
                    Job Description
                  </Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the complete job description here..."
                    className="min-h-[250px] resize-y"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include requirements, responsibilities, and qualifications for best results
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold shadow-elevated"
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
            </Card>
          )}

          {/* Results Section */}
          {questions && (
            <div className="space-y-6 animate-fade-in">
              {/* Weak Areas Section */}
              {questions.weakAreas && questions.weakAreas.length > 0 && (
                <Card className="p-6 bg-muted/50 border-2 border-primary/20 shadow-card">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-3 flex-1">
                      <h3 className="font-semibold text-xl">Weak Areas to Prepare For</h3>
                      <p className="text-sm text-muted-foreground">
                        Based on your target role and job description, focus on these key areas:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {questions.weakAreas.map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-sm py-2 px-3">
                            {area}
                          </Badge>
                        ))}
                      </div>
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

              {/* Questions Tabs */}
              <Card className="p-8 shadow-card">
                <Tabs defaultValue="behavioral" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 h-12">
                    <TabsTrigger value="behavioral" className="text-base">
                      Behavioral ({questions.behavioral.length})
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="text-base">
                      Technical ({questions.technical.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="behavioral" className="space-y-4 mt-6">
                    <Accordion type="single" collapsible className="space-y-4">
                      {questions.behavioral.map((q, index) => {
                        const questionId = index;
                        const isPracticed = practicedQuestions.has(questionId);
                        
                        return (
                          <AccordionItem
                            key={index}
                            value={`behavioral-${index}`}
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
                                <div className="bg-muted/50 p-6 rounded-lg space-y-3 border border-border">
                                  <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">
                                    Sample Answer (STAR Method)
                                  </h4>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                    {q.answer}
                                  </p>
                                </div>
                                
                                {q.coachingTip && (
                                  <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                                    <p className="text-xs font-medium flex items-start gap-2">
                                      <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                      <span><strong>AI Tip:</strong> {q.coachingTip}</span>
                                    </p>
                                  </div>
                                )}

                                <div className="flex gap-2 pt-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => regenerateAnswer(index, 'behavioral')}
                                    className="gap-2"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    Regenerate Answer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={isPracticed ? "secondary" : "default"}
                                    onClick={() => togglePracticed(questionId)}
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
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4 mt-6">
                    <Accordion type="single" collapsible className="space-y-4">
                      {questions.technical.map((q, index) => {
                        const questionId = questions.behavioral.length + index;
                        const isPracticed = practicedQuestions.has(questionId);
                        
                        return (
                          <AccordionItem
                            key={index}
                            value={`technical-${index}`}
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
                                <div className="bg-muted/50 p-6 rounded-lg space-y-3 border border-border">
                                  <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">
                                    Sample Answer
                                  </h4>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                    {q.answer}
                                  </p>
                                </div>
                                
                                {q.coachingTip && (
                                  <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                                    <p className="text-xs font-medium flex items-start gap-2">
                                      <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                      <span><strong>AI Tip:</strong> {q.coachingTip}</span>
                                    </p>
                                  </div>
                                )}

                                <div className="flex gap-2 pt-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => regenerateAnswer(index, 'technical')}
                                    className="gap-2"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    Regenerate Answer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={isPracticed ? "secondary" : "default"}
                                    onClick={() => togglePracticed(questionId)}
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
