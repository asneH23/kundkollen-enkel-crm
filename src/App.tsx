import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import Quotes from "./pages/Quotes";
import Reminders from "./pages/Reminders";
import Reports from "./pages/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/kunder"
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offerter"
              element={
                <ProtectedRoute>
                  <Quotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paminnelser"
              element={
                <ProtectedRoute>
                  <Reminders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rapporter"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
