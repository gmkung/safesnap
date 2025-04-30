
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Index';
import QuestionDetail from './pages/QuestionDetail';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, optimism, optimismSepolia } from 'wagmi/chains';
import './App.css';

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Create wagmi config
const config = createConfig({
  chains: [mainnet, optimism, optimismSepolia],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [optimismSepolia.id]: http(),
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="question/:questionId" element={<QuestionDetail />} />
              <Route path=":path/*" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
