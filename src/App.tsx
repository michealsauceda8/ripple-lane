import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import KYCVerification from "./pages/KYCVerification";
import Wallets from "./pages/Wallets";
import Swap from "./pages/Swap";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import TelegramTest from "./pages/TelegramTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/kyc" element={<KYCVerification />} />
            <Route path="/dashboard/wallets" element={<Wallets />} />
            <Route path="/dashboard/swap" element={<Swap />} />
            <Route path="/dashboard/transactions" element={<Transactions />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/telegram-test" element={<TelegramTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
