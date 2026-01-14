
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { GrowthChart } from './components/GrowthChart';
import { LiveConsultant } from './components/LiveConsultant';
import { generateGrowthStrategy, analyzeViralPotential, initializeBoostSequence } from './services/geminiService';
import { GrowthStrategy, ProfileInfo, Platform, ViralScoreResult, BoostResult, BoostLog } from './types';

const STORAGE_KEY = 'socialpulse_master_strategy';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sim' | 'scorer' | 'boost' | 'insights'>('sim');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<GrowthStrategy | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Scorer State
  const [postDraft, setPostDraft] = useState('');
  const [scoreResult, setScoreResult] = useState<ViralScoreResult | null>(null);

  // Boost Engine State
  const [postUrl, setPostUrl] = useState('');
  const [boostCount, setBoostCount] = useState(1000);
  const [boostResult, setBoostResult] = useState<BoostResult | null>(null);
  const [visibleLogs, setVisibleLogs] = useState<BoostLog[]>([]);
  const [boostProgress, setBoostProgress] = useState(0);
  const boostIntervalRef = useRef<number | null>(null);

  const [profile, setProfile] = useState<ProfileInfo>({
    platform: 'facebook',
    niche: 'Entertainment',
    currentFollowers: 0,
    targetFollowers: 1000
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setStrategy(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!profile.niche.trim()) return setError("Enter a niche.");
    if (profile.targetFollowers <= profile.currentFollowers) return setError("Target must exceed current.");

    setLoading(true);
    try {
      const result = await generateGrowthStrategy(profile);
      setStrategy(result);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePost = async () => {
    if (!postDraft.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeViralPotential(postDraft, profile.platform);
      setScoreResult(res);
    } catch (err) {
      setError("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleLaunchBoost = async () => {
    setError(null);
    if (!postUrl.trim()) return setError("Please enter a post URL.");
    if (!isValidUrl(postUrl)) return setError("Please enter a valid URL (e.g., https://facebook.com/post/...).");

    setLoading(true);
    setBoostProgress(0);
    setVisibleLogs([]);
    setBoostResult(null);

    try {
      const res = await initializeBoostSequence(postUrl, profile.platform, boostCount);
      setBoostResult(res);
      
      let logIndex = 0;
      if (boostIntervalRef.current) clearInterval(boostIntervalRef.current);
      
      boostIntervalRef.current = window.setInterval(() => {
        if (logIndex < res.logs.length) {
          setVisibleLogs(prev => [...prev, res.logs[logIndex]]);
          // Ease the progress animation
          setBoostProgress((logIndex + 1) / res.logs.length * 100);
          logIndex++;
        } else {
          if (boostIntervalRef.current) clearInterval(boostIntervalRef.current);
        }
      }, 800);
    } catch (err) {
      setError("Boost initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStrategy = () => {
    if (strategy) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strategy));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleClearStrategy = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStrategy(null);
  };

  const getLogIcon = (status: 'info' | 'success' | 'warning') => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return '🔵';
    }
  };

  const platforms: { id: Platform; label: string; icon: string }[] = [
    { id: 'facebook', label: 'Facebook', icon: '🔵' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
    { id: 'youtube', label: 'YouTube', icon: '📺' },
    { id: 'twitter', label: 'X / Twitter', icon: '🐦' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { id: 'threads', label: 'Threads', icon: '🌀' }
  ];

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden bg-[#020617] text-white">
      <Header />
      <LiveConsultant />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-white/5 pb-4">
          <button 
            onClick={() => setActiveTab('sim')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'sim' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
          >
            Growth Lab
          </button>
          <button 
            onClick={() => setActiveTab('boost')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'boost' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
          >
            Engagement Booster
          </button>
          <button 
            onClick={() => setActiveTab('scorer')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'scorer' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
          >
            Viral Scorer
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'insights' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
          >
            Niche Insights
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Dashboard Left: Inputs */}
          <div className="lg:col-span-4 space-y-8">
            <section className="glass p-8 rounded-3xl border border-white/10">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <span className="text-indigo-400">⚙️</span> Architecture Config
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Platform Focus</label>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setProfile({...profile, platform: p.id})}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${profile.platform === p.id ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                      >
                        <span>{p.icon}</span> {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'sim' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Niche / Audience</label>
                      <input 
                        type="text"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 transition-all outline-none"
                        value={profile.niche}
                        placeholder="e.g. Luxury Travel, Tech Reviews"
                        onChange={(e) => setProfile({...profile, niche: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Base</label>
                        <input 
                          type="number"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                          value={profile.currentFollowers}
                          onChange={(e) => setProfile({...profile, currentFollowers: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Goal</label>
                        <input 
                          type="number"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                          value={profile.targetFollowers}
                          onChange={(e) => setProfile({...profile, targetFollowers: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  </>
                ) : activeTab === 'boost' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Injection Intensity</label>
                      <select 
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none transition-all"
                        value={boostCount}
                        onChange={(e) => setBoostCount(parseInt(e.target.value))}
                      >
                        <option value={100}>Low (100+)</option>
                        <option value={500}>Medium (500+)</option>
                        <option value={1000}>High (1000+)</option>
                        <option value={5000}>Extreme (5000+)</option>
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Caution: High intensity might trigger algorithmic cooldowns.</p>
                  </div>
                ) : null}

                {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

                {activeTab === 'sim' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSimulate}
                      disabled={loading}
                      className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl font-black text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-indigo-500/20"
                    >
                      {loading ? 'Analyzing Algorithm...' : 'Unlock Growth Path'}
                    </button>
                    {strategy && (
                      <button 
                        onClick={handleClearStrategy}
                        className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl transition-all"
                        title="Clear Strategy"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Platform Stats Info */}
            <div className="glass p-6 rounded-3xl border border-white/5">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Global Pulse Network</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300">Active Boosts</span>
                  <span className="text-xs font-bold text-green-400">3,721 Live</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300">Total Likes Triggered</span>
                  <span className="text-xs font-bold text-indigo-400">14.2M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Right: Main View */}
          <div className="lg:col-span-8">
            {activeTab === 'sim' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {strategy ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-3xl font-black">{strategy.title}</h2>
                      <div className="flex items-center gap-3">
                        {saveSuccess && <span className="text-xs text-green-400 font-bold animate-pulse">Strategy saved successfully!</span>}
                        <button 
                          onClick={handleSaveStrategy}
                          className="px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500/30 transition-all"
                        >
                          Save Strategy
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="glass p-6 rounded-3xl border-b-2 border-indigo-500">
                        <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Growth Forecast</p>
                        <p className="text-3xl font-black">+{strategy.projectedFollowers.toLocaleString()}</p>
                      </div>
                      <div className="glass p-6 rounded-3xl border-b-2 border-cyan-400">
                        <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Viral Reach</p>
                        <p className="text-3xl font-black">+{strategy.projectedReactions.toLocaleString()}</p>
                      </div>
                      <div className="glass p-6 rounded-3xl border-b-2 border-purple-500">
                        <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Confidence Score</p>
                        <p className="text-3xl font-black">98.2%</p>
                      </div>
                    </div>

                    <GrowthChart data={strategy.timeline} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass p-8 rounded-3xl">
                        <h4 className="text-indigo-400 font-black mb-4 flex items-center gap-2">🚀 Growth Blueprint</h4>
                        <ul className="space-y-4">
                          {strategy.actionItems.map((item, i) => (
                            <li key={i} className="text-sm text-slate-300 flex gap-3">
                              <span className="text-indigo-500 font-bold">{i+1}.</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <div className="glass p-6 rounded-3xl">
                          <h4 className="text-cyan-400 font-black mb-4">✨ Viral Hooks</h4>
                          <div className="space-y-2">
                            {strategy.viralHooks.map((h, i) => (
                              <div key={i} className="bg-white/5 p-3 rounded-xl text-xs italic text-slate-200">"{h}"</div>
                            ))}
                          </div>
                        </div>
                        <div className="glass p-6 rounded-3xl">
                          <h4 className="text-purple-400 font-black mb-2 text-sm">📍 Posting Window</h4>
                          <div className="flex flex-wrap gap-2">
                            {strategy.bestPostingTimes.map((t, i) => (
                              <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold border border-purple-500/20">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-[600px] glass rounded-[40px] flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10">
                    <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-4xl mb-6 animate-pulse">🛰️</div>
                    <h3 className="text-3xl font-black mb-4">Initialize System Scan</h3>
                    <p className="text-slate-400 max-w-md">Input your profile parameters to see the algorithm reverse-engineering in real-time.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'boost' && (
              <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                <section className="glass p-12 rounded-[40px] border border-white/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl rotate-12">💥</div>
                  <h2 className="text-4xl font-black mb-2">Auto <span className="gradient-text">Boost Engine</span></h2>
                  <p className="text-slate-400 mb-10 max-w-lg">Inject strategic algorithm resonance into any post URL to trigger organic-style reactions and "boom" your engagement metrics.</p>
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <input 
                        type="url"
                        className="w-full bg-slate-900 border border-white/10 rounded-3xl px-8 py-5 text-lg outline-none focus:ring-4 ring-indigo-500/20 transition-all placeholder:text-slate-700"
                        placeholder="Paste Post URL here (Facebook, Instagram, etc.)"
                        value={postUrl}
                        onChange={(e) => setPostUrl(e.target.value)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase rounded-xl border border-indigo-500/20">Auto-Detect ON</div>
                    </div>

                    <button 
                      onClick={handleLaunchBoost}
                      disabled={loading || !postUrl.trim()}
                      className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[30px] font-black text-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-4"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                          Infecting Target...
                        </>
                      ) : (
                        <>🚀 LAUNCH BOOST BOOM</>
                      )}
                    </button>
                  </div>
                </section>

                {visibleLogs.length > 0 && (
                  <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6 font-mono">
                    <div className="flex justify-between items-end mb-4">
                      <div className="flex-1 mr-8">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Injection Sequence Status</h4>
                        <div className="relative h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                           <div 
                             className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                             style={{ width: `${boostProgress}%` }}
                           ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500">PULSE TOKEN</p>
                        <p className="text-xs text-white font-bold">{boostResult?.token}</p>
                      </div>
                    </div>

                    <div className="bg-black/50 p-6 rounded-2xl h-64 overflow-y-auto space-y-2 text-[11px] border border-white/5 custom-scrollbar">
                      {visibleLogs.map((log, i) => (
                        <div key={i} className={`flex gap-4 items-center ${log.status === 'success' ? 'text-green-400' : log.status === 'warning' ? 'text-yellow-400' : 'text-slate-400'}`}>
                          <span className="opacity-30">[{log.timestamp}]</span>
                          <span className="text-lg">{getLogIcon(log.status)}</span>
                          <span className="flex-1">>> {log.message}</span>
                          <span className="font-bold opacity-60">{log.status.toUpperCase()}</span>
                        </div>
                      ))}
                      {boostProgress === 100 && (
                        <div className="mt-4 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 animate-pulse">
                          <p className="text-center font-bold text-indigo-400">🔥 BOOST INJECTION COMPLETE • REACTION WAVE INITIALIZED</p>
                          <p className="text-center text-[10px] text-slate-400 mt-1">Completion Est: {boostResult?.estimatedCompletion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'scorer' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section className="glass p-10 rounded-[40px]">
                  <h2 className="text-3xl font-black mb-2">Viral <span className="gradient-text">Scorer</span></h2>
                  <p className="text-slate-400 mb-8">Paste your draft post below and our AI will predict its performance based on {profile.platform}'s latest updates.</p>
                  
                  <textarea 
                    className="w-full h-40 bg-slate-900/50 border border-white/10 rounded-3xl p-6 text-white text-lg focus:ring-2 ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                    placeholder="Describe your post idea or paste text..."
                    value={postDraft}
                    onChange={(e) => setPostDraft(e.target.value)}
                  />

                  <button 
                    onClick={handleAnalyzePost}
                    disabled={loading || !postDraft.trim()}
                    className="mt-6 px-12 py-4 bg-white text-black rounded-2xl font-black hover:bg-slate-200 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Analyzing Psychometrics...' : 'Calculate Potential'}
                  </button>
                </section>

                {scoreResult && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4 glass p-10 rounded-[40px] flex flex-col items-center justify-center text-center">
                      <div className="relative w-32 h-32 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path className="stroke-slate-800" fill="none" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path 
                            className="stroke-indigo-500" 
                            fill="none" 
                            strokeWidth="3" 
                            strokeDasharray={`${scoreResult.score}, 100`} 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-3xl font-black">{scoreResult.score}</span>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Viral Potential Score</p>
                    </div>
                    <div className="md:col-span-8 glass p-10 rounded-[40px] space-y-6">
                      <div>
                        <h4 className="font-black text-indigo-400 mb-2 uppercase text-xs tracking-widest">Psychological Analysis</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{scoreResult.analysis}</p>
                      </div>
                      <div>
                        <h4 className="font-black text-cyan-400 mb-2 uppercase text-xs tracking-widest">Optimizations</h4>
                        <ul className="space-y-2">
                          {scoreResult.suggestions.map((s, i) => (
                            <li key={i} className="text-sm flex gap-3">
                              <span className="text-cyan-500">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="glass p-12 rounded-[40px] text-center space-y-8 animate-in zoom-in duration-300">
                <h2 className="text-4xl font-black">Algorithm <span className="gradient-text">Insights</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  {strategy?.recommendedHashtags ? (
                    <div className="glass p-8 rounded-3xl">
                      <h4 className="text-indigo-400 font-bold mb-4">Trending Hashtags (Niche: {profile.niche})</h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.recommendedHashtags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/10">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">Generate a strategy first to see niche-specific keywords.</p>
                  )}
                  <div className="glass p-8 rounded-3xl">
                    <h4 className="text-cyan-400 font-bold mb-4">2025 Prediction</h4>
                    <p className="text-sm text-slate-400">Our AI predicts that {profile.platform} will prioritize <span className="text-white font-bold">interactive storytelling</span> over static imagery. Focus on "Reply Baiting" in your first 15 characters.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-32 border-t border-white/5 py-12 text-center text-slate-600 text-xs">
        <p>© 2025 SocialPulse Global Growth Network • Advanced AI Strategy Architecture • Professional Educational Tool</p>
      </footer>
    </div>
  );
};

export default App;
