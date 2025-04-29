
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createConfig, WagmiProvider, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import QuestionDetail from "./pages/QuestionDetail";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance directly
// @tanstack/react-query v5 requires using the createQueryClient function
import { createQueryClient } from "@tanstack/react-query";
const queryClient = createQueryClient();

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  }
});

const App = () => {
  // Set document title when the app loads
  useEffect(() => {
    document.title = "Kleros SafeSnap";
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/ens/*" element={<Index />} />
                <Route path="/:daoName" element={<Index />} />
                <Route path="/question/:id" element={<QuestionDetail />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
            <Sonner className="backdrop-blur-md" />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
