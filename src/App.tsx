
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
import { Suspense } from "react";

// 配置 QueryClient 以優化性能
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 分鐘
      gcTime: 1000 * 60 * 10, // 10 分鐘
      refetchOnWindowFocus: false, // 避免不必要的重新載入
      retry: 1, // 減少重試次數
    },
  },
});

// 載入中組件
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
      <p className="text-emerald-800 text-lg">Luck Go 載入中...</p>
      <p className="text-emerald-600 text-sm mt-2">正在初始化系統</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LiffProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </LiffProvider>
  </QueryClientProvider>
);

export default App;
