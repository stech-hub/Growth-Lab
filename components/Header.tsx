
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            SP
          </div>
          <span className="text-2xl font-black tracking-tighter">SocialPulse <span className="text-indigo-400">AI</span></span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Lab</a>
          <a href="#" className="hover:text-white transition-colors">Strategies</a>
          <a href="#" className="hover:text-white transition-colors">Auto-Sim</a>
          <button className="px-5 py-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-all font-bold">
            Connect Account
          </button>
        </nav>
      </div>
    </header>
  );
};
