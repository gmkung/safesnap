
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import './App.css';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import QuestionDetail from './pages/QuestionDetail';
import { WagmiProviderWrapper } from './providers/WagmiProvider';
import ConnectWallet from './components/ConnectWallet';

function App() {
  return (
    <WagmiProviderWrapper>
      <Router>
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
            <div className="container flex items-center justify-between h-16 px-4 mx-auto">
              <h1 className="text-2xl font-bold text-foreground">Reality <span className="text-tron">Kleros</span></h1>
              <ConnectWallet />
            </div>
          </header>
          <main className="flex-1 container mx-auto pb-8">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/question/:id" element={<QuestionDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="border-t border-border py-4 bg-background">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              Reality Kleros Explorer &copy; {new Date().getFullYear()}
            </div>
          </footer>
        </div>
        <Toaster />
      </Router>
    </WagmiProviderWrapper>
  );
}

export default App;
