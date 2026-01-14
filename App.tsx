
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GrowthChart } from './components/GrowthChart';
import { LiveConsultant } from './components/LiveConsultant';
import { generateGrowthStrategy } from './services/geminiService';
import { GrowthStrategy, ProfileInfo } from './types';

const STORAGE_KEY = 'socialpulse_saved_strategy';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<GrowthStrategy | null>(null);
  const [profile, setProfile] = useState<ProfileInfo>({
    platform: 'facebook',
    niche: 'Entertainment',
    currentFollowers: 0,
    targetFollowers: 1000
  });

  // Load saved strategy on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setStrategy(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved strategy", e);
      }
    }
  }, []);

  const validateInputs = () => {
    if (!profile.niche.trim()) {
      return "Please enter a niche for your account.";
    }
    if (profile.currentFollowers < 0) {
      return "Current followers cannot be negative.";
    }
    if (profile.targetFollowers <= profile.currentFollowers) {
      return "Target followers must be greater than your current follower count.";
    }
    return null;
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await generateGrowthStrategy(profile);
      setStrategy(result);
    } catch (err: any) {
      setError(err.message || "Simulation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStrategy = () => {
    if (strategy) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strategy));
      alert("Strategy saved successfully to your local browser storage!");
    }
  };

  const handleClearSaved = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStrategy(null);
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      <Header />
      <LiveConsultant />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Hero & Input Section */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight text-white">
              Get <span className="gradient-text">1000+</span> Real <br />
              <span className="italic">Engagement</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-lg">
              Our advanced AI simulations reverse-engineer viral algorithms to give you real followers and reactions. Start your growth lab session below.
            </p>

            <form onSubmit={handleSimulate} className="glass p-8 rounded-3xl space-y-6 shimmer">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Platform</label>
                  <select 
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all text-white"
                    value={profile.platform}
                    onChange={(e) => setProfile({...profile, platform: e.target.value as any})}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Niche</label>
                  <input 
                    type="text"
                    placeholder="e.g. Gaming"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all text-white"
                    value={profile.niche}
                    onChange={(e) => setProfile({...profile, niche: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Followers</label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all text-white"
                    value={profile.currentFollowers}
                    onChange={(e) => setProfile({...profile, currentFollowers: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Target Goal</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all text-white"
                    value={profile.targetFollowers}
                    onChange={(e) => setProfile({...profile, targetFollowers: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 font-black text-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20 text-white"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Simulating Growth...
                  </span>
                ) : 'Generate Growth Strategy'}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://picsum.photos/40/40?random=${i}`} className="w-10 h-10 rounded-full border-2 border-slate-950" alt="user" />
                ))}
              </div>
              <p className="text-sm text-slate-400 font-medium">
                <span className="text-white font-bold">4.2k+</span> accounts grown this week
              </p>
            </div>
          </div>

          {/* Visualization & Results */}
          <div className="lg:col-span-7 space-y-8">
            {strategy ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-white">{strategy.title}</h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSaveStrategy}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-sm font-bold transition-all"
                    >
                      Save Strategy
                    </button>
                    <button 
                      onClick={handleClearSaved}
                      className="px-4 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-xl text-sm font-bold transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-3xl border-l-4 border-indigo-500">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Projected Total Followers</p>
                    <p className="text-4xl font-black text-white">{strategy.projectedFollowers.toLocaleString()}</p>
                  </div>
                  <div className="glass p-6 rounded-3xl border-l-4 border-cyan-400">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Projected Reactions</p>
                    <p className="text-4xl font-black text-white">+{strategy.projectedReactions.toLocaleString()}</p>
                  </div>
                </div>

                <GrowthChart data={strategy.timeline} />

                <div className="glass p-8 rounded-3xl space-y-6">
                  <h3 className="text-2xl font-black text-white">Actionable Viral Strategy</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        Implementation Steps
                      </h4>
                      <ul className="space-y-3">
                        {strategy.actionItems.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-slate-300">
                            <span className="text-indigo-500 font-bold">{idx + 1}.</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        Viral Hooks
                      </h4>
                      <ul className="space-y-3">
                        {strategy.viralHooks.map((hook, idx) => (
                          <li key={idx} className="bg-white/5 border border-white/5 rounded-lg p-3 text-sm italic text-slate-200">
                            "{hook}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center glass rounded-3xl p-12 text-center border-dashed border-white/10">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-4xl mb-6">
                  🧬
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Awaiting Simulation Data</h3>
                <p className="text-slate-400 max-w-sm">
                  Configure your growth parameters on the left to initialize the SocialPulse growth projection engine.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-32 py-20 border-t border-white/5">
          <h2 className="text-center text-4xl font-black mb-16 text-white">Growth Lab <span className="gradient-text">Capabilities</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-3xl hover:bg-white/[0.05] transition-all cursor-default">
              <div className="text-3xl mb-4">🚀</div>
              <h4 className="text-xl font-bold mb-2 text-white">Algorithm Bypass</h4>
              <p className="text-slate-400 text-sm">
                Our AI simulates interaction spikes every 5 minutes to keep your profile trending in the "For You" feeds.
              </p>
            </div>
            <div className="glass p-8 rounded-3xl hover:bg-white/[0.05] transition-all cursor-default">
              <div className="text-3xl mb-4">❤️</div>
              <h4 className="text-xl font-bold mb-2 text-white">Reaction Engine</h4>
              <p className="text-slate-400 text-sm">
                Strategic "Shock Content" blueprints designed to trigger 1000+ real reactions per post based on psychological triggers.
              </p>
            </div>
            <div className="glass p-8 rounded-3xl hover:bg-white/[0.05] transition-all cursor-default">
              <div className="text-3xl mb-4">👥</div>
              <h4 className="text-xl font-bold mb-2 text-white">Auto-Targeting</h4>
              <p className="text-slate-400 text-sm">
                Automatically identifies and simulates engagement from high-value follower clusters in your specific niche.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-12 text-slate-500 text-xs">
        <p>© 2025 SocialPulse AI Growth Labs. Professional simulation tool for educational purposes.</p>
      </footer>
    </div>
  );
};

export default App;
