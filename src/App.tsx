import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import Quotes from "./pages/Quotes";
import Invoices from "./pages/Invoices";
import Reminders from "./pages/Reminders";
import Reports from "./pages/Reports"; // Legacy? Or same?
import Accounting from "./pages/Accounting";
import Profile from "./pages/Profile";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

import MobileBottomNav from "@/components/MobileBottomNav";
import MobileQuickActions from "@/components/MobileQuickActions";

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background pb-20 lg:pb-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/verifiera-email" element={<EmailVerification />} />
                <Route path="/glomt-losenord" element={<ForgotPassword />} />
                <Route path="/aterstall-losenord" element={<ResetPassword />} />
                <Route path="/integritet" element={<Privacy />} />
                <Route path="/villkor" element={<Terms />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kunder"
                  element={
                    <ProtectedRoute>
                      <Customers />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/offerter"
                  element={
                    <ProtectedRoute>
                      <Quotes />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fakturor"
                  element={
                    <ProtectedRoute>
                      <Invoices />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/paminnelser"
                  element={
                    <ProtectedRoute>
                      <Reminders />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rapporter"
                  element={
                    <ProtectedRoute>
                      <Reports />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bokforing"
                  element={
                    <ProtectedRoute>
                      <Accounting />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profil"
                  element={
                    <ProtectedRoute>
                      <Profile />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faq"
                  element={
                    <ProtectedRoute>
                      <FAQ />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
