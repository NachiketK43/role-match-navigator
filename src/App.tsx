import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ResumeOptimizer from "./pages/ResumeOptimizer";
import AICareerCoach from "./pages/AICareerCoach";
import AIResumeBuilder from "./pages/AIResumeBuilder";
import JobSpecificResume from "./pages/JobSpecificResume";
import OptimiseLinkedin from "./pages/OptimiseLinkedin";
import JobSearchAIAgent from "./pages/JobSearchAIAgent";
import AIOutreachTemplates from "./pages/AIOutreachTemplates";
import MockInterviewAIAgent from "./pages/MockInterviewAIAgent";
import InterviewPreparationHub from "./pages/InterviewPreparationHub";
import InterviewQuestionBank from "./pages/InterviewQuestionBank";
import BookMentorshipCall from "./pages/BookMentorshipCall";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-optimizer"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ResumeOptimizer />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-career-coach"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AICareerCoach />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-resume-builder"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AIResumeBuilder />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-specific-resume"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <JobSpecificResume />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/optimise-linkedin"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <OptimiseLinkedin />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-search-ai-agent"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <JobSearchAIAgent />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-outreach-templates"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AIOutreachTemplates />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mock-interview-ai-agent"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MockInterviewAIAgent />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview-preparation-hub"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <InterviewPreparationHub />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview-question-bank"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <InterviewQuestionBank />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-mentorship-call"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BookMentorshipCall />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
