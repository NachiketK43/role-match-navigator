import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ResumeOptimizer from "./pages/ResumeOptimizer";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";
import PracticeInterviewQuestions from "./pages/PracticeInterviewQuestions";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import ApplicationTracker from "./pages/ApplicationTracker";
import NetworkingHub from "./pages/NetworkingHub";

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
              path="/cover-letter-generator"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CoverLetterGenerator />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
              <Route
                path="/practice-interview-questions"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PracticeInterviewQuestions />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/application-tracker"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ApplicationTracker />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/networking-hub"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <NetworkingHub />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
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
