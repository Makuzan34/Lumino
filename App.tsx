
import React, { useState, useEffect, useRef } from 'react';
import { Habit, Category, Challenge, UserStats, Notification as AppNotification, HeroicTitle, Rarity } from './types';
import { 
  DEFAULT_HABITS, 
  CATEGORY_LABELS, 
  DEFAULT_CHALLENGES, 
  XP_PER_HABIT, 
  XP_PER_CHALLENGE_DAY, 
  XP_CHALLENGE_COMPLETE,
  MAX_LEVEL,
  GET_RANK,
  QUEST_LIBRARY,
  HEROIC_TITLES
} from './constants';
import HabitCard from './components/HabitCard';
import FocusTimer from './components/FocusTimer';
import AddTaskModal from './components/AddTaskModal';
import AddChallengeModal from './components/AddChallengeModal';
import ChallengeCard from './components/ChallengeCard';
import { getDailyWellnessTip } from './services/geminiService';

const Wings: React.FC<{ rarity: Rarity, className?: string }> = ({ rarity, className }) => {
  const theme = {
    common: { 
      grad: ['#92400e', '#78350f'], 
      glow: 'rgba(120, 53, 15, 0.1)'
    },
    rare: { 
      grad: ['#64748b', '#334155'], 
      glow: 'rgba(51, 65, 85, 0.15)'
    },
    epic: { 
      grad: ['#fbbf24', '#d97706'], 
      glow: 'rgba(217, 119, 6, 0.3)'
    },
    legendary: { 
      grad: ['#6366f1', '#1e1b4b'], 
      glow: 'rgba(99, 102, 241, 0.4)'
    },
  }[rarity];

  return (
    <svg viewBox="0 0 600 240" className={`w-full h-auto pointer-events-none ${className}`}>
      <defs>
        <linearGradient id={`wing-grad-${rarity}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: theme.grad[0], stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: theme.grad[1], stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: theme.grad[0], stopOpacity: 1 }} />
        </linearGradient>
        <filter id="premium-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <g style={{ filter: 'url(#premium-glow)' }} fill="none" stroke={`url(#wing-grad-${rarity})`} strokeLinecap="round">
        {/* NOYAU CENTRAL (Le lien) */}
        <g transform="translate(300, 120)">
          <path d="M-10 -30 L10 -30 L15 0 L10 30 L-10 30 L-15 0 Z" strokeWidth="1" opacity="0.3" />
          <circle cx="0" cy="0" r="8" strokeWidth="2" opacity="0.6" />
          <path d="M0 -40 L0 -60 M0 40 L0 60" strokeWidth="1" opacity="0.4" />
        </g>

        {/* AILE GAUCHE */}
        <g transform="translate(285, 120) scale(-1, 1)">
          {/* Forme Principale */}
          <path d="M0 0 C60 -60, 180 -100, 260 -20 C220 -10, 120 0, 0 0 Z" strokeWidth="2.5" />
          {/* Détails Tribaux */}
          <path d="M20 15 C60 40, 140 80, 210 90 C180 70, 100 50, 20 15" opacity="0.6" strokeWidth="1.5" />
          <path d="M40 -10 C90 -40, 160 -50, 200 -30" opacity="0.4" strokeWidth="1" />
          <path d="M10 30 L50 60" opacity="0.2" strokeWidth="1" />
        </g>
        
        {/* AILE DROITE */}
        <g transform="translate(315, 120)">
          <path d="M0 0 C60 -60, 180 -100, 260 -20 C220 -10, 120 0, 0 0 Z" strokeWidth="2.5" />
          <path d="M20 15 C60 40, 140 80, 210 90 C180 70, 100 50, 20 15" opacity="0.6" strokeWidth="1.5" />
          <path d="M40 -10 C90 -40, 160 -50, 200 -30" opacity="0.4" strokeWidth="1" />
          <path d="M10 30 L50 60" opacity="0.2" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );
};

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lumino_habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('lumino_challenges');
    return saved ? JSON.parse(saved) : DEFAULT_CHALLENGES;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lumino_stats');
    const defaultStats: UserStats = { 
      xp: 0, 
      level: 1, 
      totalXp: 0, 
      streak: 0, 
      lastLoginDate: null,
      unlockedTitleIds: ['title-1'],
      selectedTitleId: 'title-1',
      totalHabitsCompleted: 0,
      totalChallengesCompleted: 0,
      totalFocusMinutes: 0
    };
    return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('lumino_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [wellnessTip, setWellnessTip] = useState<string>('Le destin vous attend...');
  const [activeTab, setActiveTab] = useState<'home' | 'focus' | 'challenges'>('home');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [xpPopups, setXpPopups] = useState<{id: string, amount: number, x: number}[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showTitleGallery, setShowTitleGallery] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { localStorage.setItem('lumino_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('lumino_challenges', JSON.stringify(challenges)); }, [challenges]);
  useEffect(() => { 
    localStorage.setItem('lumino_stats', JSON.stringify(stats)); 
    checkTitleUnlocks();
  }, [stats]);
  useEffect(() => { localStorage.setItem('lumino_notifications', JSON.stringify(notifications)); }, [notifications]);

  useEffect(() => {
    const fetchTip = async () => setWellnessTip(await getDailyWellnessTip());
    fetchTip();
    checkDailyLogin();
  }, []);

  useEffect(() => { if (editingHabit) setIsHabitModalOpen(true); }, [editingHabit]);
  useEffect(() => { if (editingChallenge) setIsChallengeModalOpen(true); }, [editingChallenge]);

  const checkTitleUnlocks = () => {
    const newlyUnlocked: string[] = [];
    HEROIC_TITLES.forEach(title => {
      if (!stats.unlockedTitleIds.includes(title.id) && title.condition(stats)) {
        newlyUnlocked.push(title.id);
        addNotification("Nouvelle Distinction", `${title.name}`, 'level');
      }
    });
    if (newlyUnlocked.length > 0) {
      setStats(prev => ({ ...prev, unlockedTitleIds: [...prev.unlockedTitleIds, ...newlyUnlocked] }));
    }
  };

  const checkDailyLogin = () => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastLoginDate === today) return;
    let newStreak = 1;
    if (stats.lastLoginDate) {
      const diff = Math.ceil(Math.abs(new Date(today).getTime() - new Date(stats.lastLoginDate).getTime()) / (1000 * 3600 * 24));
      if (diff === 1) newStreak = stats.streak + 1;
    }
    const bonusXp = 20 + (newStreak * 5);
    addXp(bonusXp, `Assiduité : ${newStreak} jours`);
    setStats(prev => ({ ...prev, streak: newStreak, lastLoginDate: today }));
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = { id: crypto.randomUUID(), title, message, timestamp: Date.now(), type, read: false };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const triggerXpFeedback = (amount: number) => {
    const id = crypto.randomUUID();
    setXpPopups(prev => [...prev, { id, amount, x: Math.random() * 60 + 20 }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 2000);
  };

  const addXp = (amount: number, reason: string) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let xpNeeded = newLevel * 100;
      while (newXp >= xpNeeded && newLevel < MAX_LEVEL) {
        newXp -= xpNeeded;
        newLevel++;
        xpNeeded = newLevel * 100;
        addNotification("Ascension", `Niveau ${newLevel} atteint`, 'level');
      }
      triggerXpFeedback(amount);
      return { ...prev, xp: newXp, level: newLevel, totalXp: (prev.totalXp || 0) + amount };
    });
  };

  const handleDownloadAchievement = (title: HeroicTitle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.beginPath();
    ctx.arc(540, 960, 400, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 60px Inter';
    ctx.fillText('LUMINO ACHIEVEMENT', 540, 600);
    ctx.font = 'bold 120px Playfair Display';
    ctx.fillStyle = title.rarity === 'legendary' ? '#f59e0b' : '#ffffff';
    ctx.fillText(title.name.toUpperCase(), 540, 960);
    ctx.font = '40px Inter';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(title.description, 540, 1040);
    const link = document.createElement('a');
    link.download = `lumino_${title.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        if (!h.completed) {
          addXp(XP_PER_HABIT, h.name);
          setStats(s => ({ ...s, totalHabitsCompleted: s.totalHabitsCompleted + 1 }));
        }
        return { ...h, completed: !h.completed };
      }
      return h;
    }));
  };

  const currentTitle = HEROIC_TITLES.find(t => t.id === stats.selectedTitleId) || HEROIC_TITLES[0];
  const levelProgress = (stats.xp / (stats.level * 100)) * 100;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-28 relative overflow-x-hidden shadow-2xl">
      <canvas ref={canvasRef} width="1080" height="1920" className="hidden" />
      
      <style>{`
        @keyframes xpFloat { 0% { opacity:0; transform:translateY(0); } 20% { opacity:1; } 100% { opacity:0; transform:translateY(-100px); } }
        .xp-p { position: fixed; z-index: 99; pointer-events: none; animation: xpFloat 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        
        @keyframes linkedBreath { 
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.6; } 
          50% { transform: scale(1.05) translateY(-5px); opacity: 0.9; } 
        }
        .wings-container { animation: linkedBreath 8s ease-in-out infinite; }

        .tab-active { position: relative; }
        .tab-active::after { content: ''; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
      `}</style>

      {xpPopups.map(p => (
        <div key={p.id} className="xp-p" style={{ left: `${p.x}%`, top: '45%' }}>
          <div className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-2xl border border-indigo-400">+{p.amount} XP</div>
        </div>
      ))}

      <header className="px-8 pt-16 pb-12 bg-white sticky top-0 z-30 overflow-hidden">
        <div className="flex justify-between items-center mb-16 relative z-10">
          <button onClick={() => setShowNotificationCenter(true)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          
          <div className="flex-grow flex flex-col items-center relative py-8">
             {/* SYSTÈME D'AILES LIÉES */}
             <div className="absolute inset-0 flex items-center justify-center wings-container -z-10 overflow-visible">
                <Wings rarity={currentTitle.rarity} className="w-[500px] h-auto transform scale-110" />
             </div>
             
             <div className="relative z-10 flex flex-col items-center">
                <h1 onClick={() => setShowTitleGallery(true)} className="text-3xl font-display text-slate-900 cursor-pointer tracking-tighter">Lumino</h1>
                <div className={`text-[9px] font-black uppercase tracking-[0.3em] mt-2 px-4 py-1 rounded-full ${
                  currentTitle.rarity === 'legendary' ? 'text-indigo-600 bg-indigo-50 shadow-sm border border-indigo-100' : 
                  currentTitle.rarity === 'epic' ? 'text-amber-600 bg-amber-50 shadow-sm border border-amber-100' : 
                  currentTitle.rarity === 'rare' ? 'text-slate-600 bg-slate-50 shadow-sm border border-slate-200' :
                  'text-slate-400 bg-slate-50'
                }`}>
                  {currentTitle.name}
                </div>
             </div>
          </div>

          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-xl">
            {stats.level}
          </div>
        </div>

        <div className="relative flex flex-col items-center max-w-[320px] mx-auto">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative mb-5 shadow-inner">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full transition-all duration-1000 ease-out" style={{ width: `${levelProgress}%` }} />
          </div>
          <div className="bg-indigo-50/20 px-8 py-3 rounded-2xl border border-indigo-100/10 backdrop-blur-md">
            <p className="text-indigo-900 text-[12px] font-bold italic text-center leading-tight">
              "{wellnessTip}"
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        {activeTab === 'home' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase text-[12px]">Grille d'Aventure</h2>
               <button onClick={() => { setEditingHabit(null); setIsHabitModalOpen(true); }} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">
                 <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               </button>
            </div>
            <div className="space-y-4">
              {habits.length === 0 ? (
                <div className="py-20 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 italic text-sm">Préparez vos prochaines quêtes.</p>
                </div>
              ) : (
                habits.map(h => (
                  <HabitCard key={h.id} habit={h} onToggle={toggleHabit} onDelete={(id) => setHabits(habits.filter(x => x.id !== id))} onEdit={setEditingHabit} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'focus' && (
          <div className="space-y-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase text-[12px]">Zone de Focus</h2>
            <FocusTimer onSessionComplete={(m) => setStats(s => ({ ...s, totalFocusMinutes: s.totalFocusMinutes + m }))} />
          </div>
        )}
        
        {activeTab === 'challenges' && (
          <div className="space-y-8">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase text-[12px]">Grimoire de Quêtes</h2>
               <button onClick={() => { setEditingChallenge(null); setIsChallengeModalOpen(true); }} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">
                 <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               </button>
             </div>
             <div className="space-y-6">
               {challenges.length === 0 ? (
                 <div className="py-20 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 italic text-sm">Le grimoire est vide.</p>
                 </div>
               ) : (
                 challenges.map(c => <ChallengeCard key={c.id} challenge={c} onEdit={setEditingChallenge} onDelete={(id) => setChallenges(challenges.filter(x => x.id !== id))} onCheckIn={(id) => {
                   setChallenges(challenges.map(x => x.id === id ? { ...x, currentDay: x.currentDay + 1, lastCompletedDate: new Date().toISOString().split('T')[0] } : x));
                   addXp(XP_PER_CHALLENGE_DAY, c.title);
                 }} />)
               )}
             </div>
          </div>
        )}
      </main>

      {showTitleGallery && (
        <div className="fixed inset-0 z-[100] bg-white p-8 overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center mb-10 sticky top-0 bg-white/95 backdrop-blur-md pt-4 pb-2 z-10">
            <div>
              <h3 className="text-3xl font-display text-slate-900">Le Panthéon</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Symphonie de Pouvoir : {stats.unlockedTitleIds.length} / {HEROIC_TITLES.length}
              </p>
            </div>
            <button onClick={() => setShowTitleGallery(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">✕</button>
          </div>
          <div className="grid gap-6 pb-12">
            {HEROIC_TITLES.map(title => {
              const unlocked = stats.unlockedTitleIds.includes(title.id);
              const active = stats.selectedTitleId === title.id;
              return (
                <div key={title.id} className={`p-8 rounded-[3rem] border transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center ${
                  unlocked 
                    ? 'bg-white border-slate-100 shadow-xl' 
                    : 'bg-slate-50 border-transparent opacity-60'
                }`}>
                  <div className="flex justify-between items-start w-full mb-4 z-10">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      title.rarity === 'legendary' ? 'text-indigo-600' : 
                      title.rarity === 'epic' ? 'text-amber-500' : 
                      title.rarity === 'rare' ? 'text-slate-500' :
                      'text-slate-400'
                    }`}>{title.rarity}</span>
                    {unlocked && (
                      <button onClick={() => handleDownloadAchievement(title)} className="text-slate-200 hover:text-indigo-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                    )}
                  </div>
                  <h4 className={`text-xl font-bold mb-1 z-10 ${unlocked ? 'text-slate-900' : 'text-slate-400'}`}>{title.name}</h4>
                  <p className="text-[10px] text-slate-500 mb-6 leading-relaxed z-10 italic">{title.description}</p>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl mb-6 z-10 ${
                    unlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {unlocked ? 'Éveillé ✨' : `Rituel requis : ${title.requirementText}`}
                  </div>
                  {unlocked && !active && (
                    <button onClick={() => setStats(prev => ({ ...prev, selectedTitleId: title.id }))} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all z-10">Revêtir le Titre</button>
                  )}
                  {active && <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center py-4 bg-indigo-50 rounded-2xl w-full z-10 shadow-inner">Porté Actuellement</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showNotificationCenter && (
        <div className="fixed inset-0 z-[300] bg-slate-900/30 backdrop-blur-sm flex justify-end" onClick={() => setShowNotificationCenter(false)}>
          <div className="bg-white w-full max-w-[340px] h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-2xl font-bold text-slate-900">Écrits Anciens</h3>
              <button onClick={() => setShowNotificationCenter(false)} className="w-10 h-10 flex items-center justify-center text-slate-300">✕</button>
            </div>
            <div className="space-y-8">
              {notifications.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm italic">Aucun message de la guilde</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="pb-6 border-b border-slate-50 last:border-0">
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-300 block mt-3 uppercase font-bold tracking-tight">{new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-6 px-12 flex justify-between max-w-md mx-auto z-40 rounded-t-[4rem] shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'text-indigo-600 tab-active' : 'text-slate-300'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button onClick={() => setActiveTab('challenges')} className={`p-3 rounded-2xl transition-all ${activeTab === 'challenges' ? 'text-indigo-600 tab-active' : 'text-slate-300'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </button>
        <button onClick={() => setActiveTab('focus')} className={`p-3 rounded-2xl transition-all ${activeTab === 'focus' ? 'text-indigo-600 tab-active' : 'text-slate-300'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
      </nav>

      <AddTaskModal 
        isOpen={isHabitModalOpen} 
        onClose={() => { setIsHabitModalOpen(false); setEditingHabit(null); }} 
        onAdd={(h) => setHabits([...habits, h])} 
        onUpdate={(h) => setHabits(habits.map(x => x.id === h.id ? h : x))} 
        editingHabit={editingHabit} 
      />

      <AddChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => { setIsChallengeModalOpen(false); setEditingChallenge(null); }}
        onAdd={(c) => { 
          setChallenges([...challenges, c]);
          addNotification("Rituel Commencé", `${c.title}`, 'quest');
        }}
        onUpdate={(c) => setChallenges(challenges.map(x => x.id === c.id ? c : x))}
        editingChallenge={editingChallenge}
      />
    </div>
  );
};

export default App;
