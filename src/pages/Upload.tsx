import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, MessageSquare, Target, BarChart3, Upload as UploadIcon, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dashboardPreview from "@/assets/dashboard-preview.png";

const Upload = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Get Hired Faster with <span className="text-primary">AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            NextHire helps you craft job-winning resumes, tailored cover letters, and interview answers — all powered by AI.
          </p>
          <div className="flex justify-center pt-8">
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold shadow-elevated hover:shadow-accent"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-6 py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to land your dream job</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UploadIcon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Upload Resume</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Let AI scan and evaluate your resume for strengths and opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Optimize for Any Job</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Match your resume to any job description with keyword suggestions and tailored improvements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Prepare for Interviews</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Get likely interview questions and AI-coached answers tailored to your role.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Resume Optimizer</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  AI-powered analysis to perfect your resume for any role
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Smart Cover Letter Generator</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Create personalized cover letters in seconds
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Interview Question Predictor</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Practice with AI-generated interview questions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Career Analytics Dashboard</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Track your progress and see where you stand
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="container mx-auto px-6 py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                See how NextHire simplifies every step
              </h2>
              <p className="text-lg text-muted-foreground">
                From resume optimization to offer letter — NextHire is your AI-powered career partner that helps you stand out in every application.
              </p>
              <Button size="lg" className="mt-4" onClick={() => navigate('/signup')}>
                Start Your Free Trial
              </Button>
            </div>
            <div className="rounded-lg border border-border overflow-hidden shadow-elevated">
              <img 
                src={dashboardPreview} 
                alt="NextHire Dashboard Preview showing resume optimization and career analytics" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-primary rounded-2xl p-12 md:p-16 shadow-accent">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Land Your Next Hire?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Start optimizing your career today — it's completely free.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="px-8 py-6 text-lg font-semibold mt-6"
            onClick={() => navigate('/signup')}
          >
            Get Started Now
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Upload;
