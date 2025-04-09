
import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-space-gray/30 mt-auto py-6 backdrop-blur-md relative overflow-hidden">
      <div className="absolute inset-0 bg-space-glow opacity-30 animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="steel-panel px-6 py-3 rounded-lg animate-holo-glow">
            <p className="text-space-light/90 text-sm flex items-center">
              <span className="text-space font-medium mr-2">Kleros SafeSnap</span> 
              <span className="text-space-accent">2025</span>
            </p>
          </div>
          
          <div className="glass-panel px-6 py-3 rounded-lg border border-space/20">
            <div className="flex items-center gap-3">
              <a href="https://github.com/kleros" target="_blank" rel="noopener noreferrer" className="text-space-light/70 hover:text-space transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="https://twitter.com/kleros_io" target="_blank" rel="noopener noreferrer" className="text-space-light/70 hover:text-space transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="https://kleros.io" target="_blank" rel="noopener noreferrer" className="text-space-light/70 hover:text-space transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="glass-panel px-6 py-3 rounded-lg">
            <p className="text-sm text-space-light/70 flex items-center">
              Made with <Heart className="h-3 w-3 text-red-500 mx-1 animate-pulse" /> for Reality
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
