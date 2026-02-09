
import React, { useState, useEffect, useRef } from 'react';
import { Habit, Category, Challenge, UserStats, Notification as AppNotification, HeroicTitle, Rarity, Difficulty } from './types';
import { 
  DEFAULT_HABITS, 
  CATEGORY_LABELS, 
  DEFAULT_CHALLENGES, 
  HABIT_XP_VALUES,
  CHALLENGE_XP_VALUES,
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
import StreakCard from './components/StreakCard';
import WeeklyOverview from './components/WeeklyOverview';
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
        <g transform="translate(300, 120)">
          <path d="M-10 -30 L10 -30 L15 0 L10 30 L-10 30 L-15 0 Z" strokeWidth="1" opacity="0.3" />
          <circle cx="0" cy="0" r="8" strokeWidth="2" opacity="0.6" />
          <path d="M0 -40 L0 -60 M0 40 L0 60" strokeWidth="1" opacity="0.4" />
        </g>
        <g transform="translate(285, 120) scale(-1, 1)">
          <path d="M0 0 C60 -60, 180 -100, 260 -20 C220 -10, 120 0, 0 0 Z" strokeWidth="2.5" />
          <path d="M20 15 C60 40, 140 80, 210 90 C180 70, 100 50, 20 15" opacity="0.6" strokeWidth="1.5" />
          <path d="M40 -10 C90 -40, 160 -50, 200 -30" opacity="0.4" strokeWidth="1" />
          <path d="M10 30 L50 60" opacity="0.2" strokeWidth="1" />
        </g>
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
    const initial = saved ? JSON.parse(saved) : DEFAULT_HABITS;
    // Auto-organize by time on load
    return initial.sort((a: Habit, b: Habit) => (a.time || '').localeCompare(b.time || ''));
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
      lastRefreshDate: null,
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
  const [activeTab, setActiveTab] = useState<'home' | 'weekly' | 'challenges' | 'focus'>('home');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [targetDateForHabit, setTargetDateForHabit] = useState<string | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [xpPopups, setXpPopups] = useState<{id: string, amount: number, x: number}[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showTitleGallery, setShowTitleGallery] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drag and drop state
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);
  const [draggedChallengeId, setDraggedChallengeId] = useState<string | null>(null);

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
    checkDailyRefresh();
  }, []);

  useEffect(() => { if (editingHabit) setIsHabitModalOpen(true); }, [editingHabit]);
  useEffect(() => { if (editingChallenge) setIsChallengeModalOpen(true); }, [editingChallenge]);

  const checkDailyRefresh = () => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastRefreshDate !== today) {
      setHabits(prev => prev.map(h => ({ ...h, completed: false })));
      setStats(prev => ({ ...prev, lastRefreshDate: today }));
      addNotification("Nouveau Jour", "Vos rituels quotidiens ont été réinitialisés.", 'info');
    }
  };

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
    updateXp(bonusXp);
    addNotification("Série Quotidienne", `Flamme de ${newStreak} jours ! +${bonusXp} XP.`, 'xp');

    if (newStreak === 7) {
      updateXp(100);
      addNotification("Palier de Série", "Semaine de Fer atteinte ! +100 XP.", 'level');
    } else if (newStreak === 30) {
      updateXp(500);
      addNotification("Palier de Série", "Mois de Maîtrise atteint ! +500 XP.", 'level');
    }

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

  const updateXp = (amount: number) => {
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
      while (newXp < 0 && newLevel > 1) {
        newLevel--;
        let prevXpNeeded = newLevel * 100;
        newXp = prevXpNeeded + newXp;
      }
      if (newXp < 0) newXp = 0;
      if (amount > 0) triggerXpFeedback(amount);
      return { ...prev, xp: newXp, level: newLevel, totalXp: Math.max(0, (prev.totalXp || 0) + amount) };
    });
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isNowCompleted = !h.completed;
        const xpAmount = HABIT_XP_VALUES[h.difficulty || Difficulty.MEDIUM];
        if (isNowCompleted) {
          updateXp(xpAmount);
          setStats(s => ({ ...s, totalHabitsCompleted: s.totalHabitsCompleted + 1 }));
        } else {
          setStats(s => ({ ...s, totalHabitsCompleted: Math.max(0, s.totalHabitsCompleted - 1) }));
        }
        return { ...h, completed: isNowCompleted };
      }
      return h;
    }));
  };

  const handleDuplicateHabit = (habit: Habit) => {
    const newHabit = { ...habit, id: crypto.randomUUID(), name: `${habit.name} (Copie)`, completed: false };
    const newHabits = [...habits, newHabit].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    setHabits(newHabits);
    addNotification("Duplication", `Rituel dupliqué : ${habit.name}`, 'info');
  };

  const sortHabitsByTime = (list: Habit[]) => {
    return [...list].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  };

  // Drag and Drop Handlers
  const onHabitDragStart = (id: string) => setDraggedHabitId(id);
  const onHabitDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedHabitId === id) return;
    const items = [...habits];
    const draggedIdx = items.findIndex(h => h.id === draggedHabitId);
    const overIdx = items.findIndex(h => h.id === id);
    const [draggedItem] = items.splice(draggedIdx, 1);
    items.splice(overIdx, 0, draggedItem);
    setHabits(items);
  };
  const onHabitDrop = () => setDraggedHabitId(null);

  const onChallengeDragStart = (id: string) => setDraggedChallengeId(id);
  const onChallengeDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedChallengeId === id) return;
    const items = [...challenges];
    const draggedIdx = items.findIndex(c => c.id === draggedChallengeId);
    const overIdx = items.findIndex(c => c.id === id);
    const [draggedItem] = items.splice(draggedIdx, 1);
    items.splice(overIdx, 0, draggedItem);
    setChallenges(items);
  };
  const onChallengeDrop = () => setDraggedChallengeId(null);

  const currentTitle = HEROIC_TITLES.find(t => t.id === stats.selectedTitleId) || HEROIC_TITLES[0];
  const xpNeeded = stats.level * 100;
  const levelProgress = (stats.xp / xpNeeded) * 100;

  const todayStr = new Date().toISOString().split('T')[0];
  const homeHabits = habits.filter(h => !h.dueDate || h.dueDate === todayStr);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-28 relative overflow-x-hidden shadow-2xl text-slate-900">
      <header className="px-8 pt-16 pb-12 bg-white sticky top-0 z-30 overflow-hidden">
        <div className="flex justify-between items-center mb-16 relative z-10">
          <button onClick={() => setShowNotificationCenter(true)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          
          <div className="flex-grow flex flex-col items-center relative py-8">
             <div className="absolute inset-0 flex items-center justify-center wings-container -z-10 overflow-visible">
                <Wings rarity={currentTitle.rarity} className="w-[500px] h-auto transform scale-110" />
             </div>
             <div className="relative z-10 flex flex-col items-center">
                <h1 onClick={() => setShowTitleGallery(true)} className="text-3xl font-display text-slate-900 cursor-pointer tracking-tighter">Lumino</h1>
                <div className={`text-[9px] font-black uppercase tracking-[0.3em] mt-2 px-4 py-1 rounded-full ${
                  currentTitle.rarity === 'legendary' ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 
                  currentTitle.rarity === 'epic' ? 'text-amber-600 bg-amber-50 border border-amber-100' : 
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
          <div className="w-full flex justify-between items-center mb-2 px-1 text-[10px] font-black uppercase tracking-widest">
             <span className="text-indigo-600">Niveau {stats.level}</span>
             <span className="text-slate-400">{stats.xp} / {xpNeeded} XP</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-5">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full transition-all duration-1000" style={{ width: `${levelProgress}%` }} />
          </div>
          <div className="bg-indigo-50/20 px-8 py-3 rounded-2xl border border-indigo-100/10">
            <p className="text-indigo-900 text-[12px] font-bold italic text-center leading-tight">"{wellnessTip}"</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 min-h-[400px]">
        {activeTab === 'home' && (
          <div className="space-y-10">
            <StreakCard streak={stats.streak} lastLoginDate={stats.lastLoginDate} />
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase text-[12px]">Grille d'Aventure</h2>
               <div className="flex gap-2">
                 <button 
                  onClick={() => setHabits(sortHabitsByTime(habits))}
                  className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Trier par heure"
                 >
                   <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                 </button>
                 <button onClick={() => { setEditingHabit(null); setTargetDateForHabit(todayStr); setIsHabitModalOpen(true); }} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">
                   <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                 </button>
               </div>
            </div>
            <div className="space-y-4">
              {homeHabits.length === 0 ? (
                <div className="py-20 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 italic text-sm">Préparez vos prochaines quêtes.</p>
                </div>
              ) : (
                homeHabits.map((h, idx) => (
                  <div key={h.id} onDragOver={(e) => onHabitDragOver(e, h.id)} onDrop={onHabitDrop}>
                    <HabitCard habit={h} onToggle={toggleHabit} onDelete={(id) => setHabits(habits.filter(x => x.id !== id))} onEdit={setEditingHabit} onDragStart={() => onHabitDragStart(h.id)} isDragging={draggedHabitId === h.id} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <WeeklyOverview 
            habits={habits} 
            onEdit={setEditingHabit} 
            onDelete={(id) => setHabits(habits.filter(x => x.id !== id))} 
            onDuplicate={handleDuplicateHabit}
            onAddNew={(date) => { setEditingHabit(null); setTargetDateForHabit(date); setIsHabitModalOpen(true); }}
            onReorder={setHabits}
          />
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-8">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase text-[12px]">Grimoire de Quêtes</h2>
               <button onClick={() => { setEditingChallenge(null); setIsChallengeModalOpen(true); }} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 active:scale-95">
                 <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               </button>
             </div>
             <div className="space-y-6">
               {challenges.length === 0 ? (
                 <div className="py-20 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 italic text-sm">Le grimoire est vide.</p>
                 </div>
               ) : (
                 challenges.map(c => (
                   <div key={c.id} onDragOver={(e) => onChallengeDragOver(e, c.id)} onDrop={onChallengeDrop}>
                     <ChallengeCard challenge={c} onEdit={setEditingChallenge} onDelete={(id) => setChallenges(challenges.filter(x => x.id !== id))} onCheckIn={(id) => {
                       const challenge = challenges.find(x => x.id === id);
                       if (challenge) {
                         const xpAmount = CHALLENGE_XP_VALUES[challenge.difficulty || Difficulty.MEDIUM];
                         setChallenges(challenges.map(x => x.id === id ? { ...x, currentDay: x.currentDay + 1, lastCompletedDate: todayStr } : x));
                         updateXp(xpAmount);
                       }
                     }} onDragStart={() => onChallengeDragStart(c.id)} isDragging={draggedChallengeId === c.id} />
                   </div>
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
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-6 px-8 flex justify-between max-w-md mx-auto z-40 rounded-t-[4rem] shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'text-indigo-600 tab-active' : 'text-slate-300'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button onClick={() => setActiveTab('weekly')} className={`p-3 rounded-2xl transition-all ${activeTab === 'weekly' ? 'text-indigo-600 tab-active' : 'text-slate-300'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
        onClose={() => { setIsHabitModalOpen(false); setEditingHabit(null); setTargetDateForHabit(null); }} 
        onAdd={(h) => setHabits(sortHabitsByTime([...habits, h]))} 
        onUpdate={(h) => setHabits(sortHabitsByTime(habits.map(x => x.id === h.id ? h : x)))} 
        editingHabit={editingHabit} 
        initialDate={targetDateForHabit}
      />

      <AddChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => { setIsChallengeModalOpen(false); setEditingChallenge(null); }}
        onAdd={(c) => setChallenges([...challenges, c])}
        onUpdate={(c) => setChallenges(challenges.map(x => x.id === c.id ? c : x))}
        editingChallenge={editingChallenge}
      />
    </div>
  );
};

export default App;
