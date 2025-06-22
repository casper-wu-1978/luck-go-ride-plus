
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LiffProvider } from "@/contexts/LiffContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import AuthWrapper from "@/components/AuthWrapper";
import Index from "./pages/Index";
import Driver from "./pages/Driver";
import Admin from "./pages/Admin";
import Merchant from "./pages/Merchant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LiffProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthWrapper>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/driver" element={<Driver />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/merchant" element={<Merchant />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </LiffProvider>
  </QueryClientProvider>
);

export default App;
