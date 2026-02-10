
import React, { useState, useEffect, useMemo } from 'react';
import { Habit, Category, Challenge, UserStats, Notification as AppNotification, HeroicTitle, Rarity, Difficulty, Recurrence, GrowthInsight, MoodLog } from './types';
import { 
  DEFAULT_HABITS, 
  DEFAULT_CHALLENGES, 
  HABIT_XP_VALUES,
  MAX_LEVEL,
  HEROIC_TITLES
} from './constants';
import HabitCard from './components/HabitCard';
import HabitStatsModal from './components/HabitStatsModal';
import FocusTimer from './components/FocusTimer';
import AddTaskModal from './components/AddTaskModal';
import AddChallengeModal from './components/AddChallengeModal';
import ChallengeCard from './components/ChallengeCard';
import StreakCard from './components/StreakCard';
import WeeklyOverview from './components/WeeklyOverview';
import GrowthLibrary from './components/GrowthLibrary';
import ProgressAnalytics from './components/ProgressAnalytics';
import MoodTracker from './components/MoodTracker';
import { getDailyWellnessTip, getGrowthInsight } from './services/geminiService';

export const shouldShowHabitOnDate = (habit: Habit, dateStr: string) => {
  if (habit.dueDate === dateStr) return true;
  if (habit.recurrence === Recurrence.NONE) return habit.dueDate === dateStr;
  
  const targetDate = new Date(dateStr);
  targetDate.setHours(0,0,0,0);
  const startDate = new Date(habit.startDate || habit.dueDate || dateStr);
  startDate.setHours(0,0,0,0);
  
  if (targetDate < startDate) return false;
  const diffTime = targetDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
  const rule = habit.recurrenceRule || { interval: 1 };
  const interval = rule.interval || 1;

  if (habit.recurrence === Recurrence.DAILY) return diffDays % interval === 0;
  if (habit.recurrence === Recurrence.WEEKLY) {
    const isCorrectDay = rule.daysOfWeek ? rule.daysOfWeek.includes(targetDate.getDay()) : true;
    return isCorrectDay && (Math.floor(diffDays / 7) % interval === 0);
  }
  if (habit.recurrence === Recurrence.MONTHLY) {
    const isCorrectDayOfMonth = rule.dayOfMonth ? targetDate.getDate() === rule.dayOfMonth : targetDate.getDate() === startDate.getDate();
    const months = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + (targetDate.getMonth() - startDate.getMonth());
    return isCorrectDayOfMonth && (months % interval === 0);
  }
  return false;
};

const calculateStreak = (history: string[]): number => {
  if (history.length === 0) return 0;
  const sorted = [...history].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  
  let streak = 0;
  let current = new Date(sorted[0]);
  
  for (let i = 0; i < sorted.length; i++) {
    const dateStr = sorted[i];
    const expectedStr = current.toISOString().split('T')[0];
    if (dateStr === expectedStr) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lumino_habits');
    const initial = saved ? JSON.parse(saved) : DEFAULT_HABITS;
    return initial.map((h: any) => ({
      ...h,
      completionHistory: h.completionHistory || [],
      currentStreak: h.currentStreak || 0,
      bestStreak: h.bestStreak || 0
    }));
  });
  const [challenges, setChallenges] = useState<Challenge[]>(() => JSON.parse(localStorage.getItem('lumino_challenges') || JSON.stringify(DEFAULT_CHALLENGES)));
  const [stats, setStats] = useState<UserStats>(() => {
    const s = JSON.parse(localStorage.getItem('lumino_stats') || '{}');
    return { xp: 0, level: 1, totalXp: 0, streak: 0, lastLoginDate: null, lastRefreshDate: null, unlockedTitleIds: ['title-1'], selectedTitleId: 'title-1', totalHabitsCompleted: 0, totalChallengesCompleted: 0, totalFocusMinutes: 0, moodLogs: [], ...s };
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => JSON.parse(localStorage.getItem('lumino_notifications') || '[]'));
  const [insights, setInsights] = useState<GrowthInsight[]>(() => JSON.parse(localStorage.getItem('lumino_insights') || '[]'));
  
  const [wellnessTip, setWellnessTip] = useState<string>('Sagesse en cours...');
  const [activeTab, setActiveTab] = useState<'home' | 'growth' | 'challenges' | 'focus'>('home');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [statHabit, setStatHabit] = useState<Habit | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [initialHabitDate, setInitialHabitDate] = useState<string | null>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showTitleGallery, setShowTitleGallery] = useState(false);
  const [xpPopups, setXpPopups] = useState<{id: string, amount: number, x: number}[]>([]);

  useEffect(() => { localStorage.setItem('lumino_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('lumino_challenges', JSON.stringify(challenges)); }, [challenges]);
  useEffect(() => { localStorage.setItem('lumino_stats', JSON.stringify(stats)); checkTitleUnlocks(); }, [stats]);
  useEffect(() => { localStorage.setItem('lumino_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('lumino_insights', JSON.stringify(insights)); }, [insights]);

  useEffect(() => {
    const init = async () => {
      setWellnessTip(await getDailyWellnessTip());
      const today = new Date().toISOString().split('T')[0];
      if (insights.length === 0 || new Date(insights[0].timestamp).toISOString().split('T')[0] !== today) {
        const newInsight = await getGrowthInsight();
        setInsights(prev => [newInsight, ...prev].slice(0, 10));
      }
    };
    init();
    checkDailyLogin();
    checkDailyRefresh();

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toISOString().split('T')[0];

      setHabits(prevHabits => {
        let updated = false;
        const nextHabits = prevHabits.map(habit => {
          if (
            !habit.completed && 
            habit.time === currentTimeStr && 
            shouldShowHabitOnDate(habit, todayStr) &&
            habit.notifiedDate !== todayStr
          ) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Lumino : ${habit.name}`, {
                body: habit.description || "Il est temps d'accomplir votre rituel !",
                icon: 'https://cdn-icons-png.flaticon.com/512/3252/3252980.png'
              });
            }
            updated = true;
            return { ...habit, notifiedDate: todayStr };
          }
          return habit;
        });
        return updated ? nextHabits : prevHabits;
      });
    }, 60000);

    return () => clearInterval(checkInterval);
  }, []);

  const checkDailyRefresh = () => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastRefreshDate !== today) {
      setHabits(prev => prev.map(h => ({ 
        ...h, 
        completed: h.completionHistory.includes(today) 
      })));
      setStats(prev => ({ ...prev, lastRefreshDate: today }));
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
    updateXp(20 + (newStreak * 5));
    setStats(prev => ({ ...prev, streak: newStreak, lastLoginDate: today }));
  };

  const checkTitleUnlocks = () => {
    const newlyUnlocked: string[] = [];
    HEROIC_TITLES.forEach(title => {
      if (!stats.unlockedTitleIds.includes(title.id) && title.condition(stats)) {
        newlyUnlocked.push(title.id);
        addNotification("Nouvelle Distinction", `${title.name}`, 'level');
      }
    });
    if (newlyUnlocked.length > 0) setStats(prev => ({ ...prev, unlockedTitleIds: [...prev.unlockedTitleIds, ...newlyUnlocked] }));
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    setNotifications(prev => [{ id: crypto.randomUUID(), title, message, timestamp: Date.now(), type, read: false }, ...prev].slice(0, 50));
  };

  const updateXp = (amount: number) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let xpNeeded = newLevel * 100;
      while (newXp >= xpNeeded && newLevel < MAX_LEVEL) {
        newXp -= xpNeeded; newLevel++; xpNeeded = newLevel * 100;
        addNotification("Ascension", `Niveau ${newLevel} atteint`, 'level');
      }
      return { ...prev, xp: Math.max(0, newXp), level: newLevel, totalXp: Math.max(0, (prev.totalXp || 0) + amount) };
    });
    if (amount > 0) {
      const id = crypto.randomUUID();
      setXpPopups(prev => [...prev, { id, amount, x: Math.random() * 60 + 20 }]);
      setTimeout(() => setXpPopups(p => p.filter(x => x.id !== id)), 2000);
    }
  };

  const logMood = (mood: number, energy: number) => {
    const today = new Date().toISOString().split('T')[0];
    setStats(prev => {
      const filtered = prev.moodLogs.filter(l => l.date !== today);
      return { ...prev, moodLogs: [...filtered, { date: today, mood, energy }] };
    });
    updateXp(10);
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isFinishing = !h.completed;
      let newHistory = [...h.completionHistory];
      if (isFinishing && !newHistory.includes(today)) {
        newHistory.push(today);
        updateXp(HABIT_XP_VALUES[h.difficulty]);
        setStats(s => ({ ...s, totalHabitsCompleted: s.totalHabitsCompleted + 1 }));
      } else if (!isFinishing && newHistory.includes(today)) {
        newHistory = newHistory.filter(d => d !== today);
        updateXp(-HABIT_XP_VALUES[h.difficulty]);
        setStats(s => ({ ...s, totalHabitsCompleted: Math.max(0, s.totalHabitsCompleted - 1) }));
      }
      const newStreak = calculateStreak(newHistory);
      return { 
        ...h, 
        completed: isFinishing, 
        completionHistory: newHistory,
        currentStreak: newStreak,
        bestStreak: Math.max(h.bestStreak, newStreak)
      };
    }));
  };

  const handleDuplicateHabit = (habit: Habit) => {
    const duplicated: Habit = { 
      ...habit, 
      id: crypto.randomUUID(), 
      completed: false, 
      completionHistory: [], 
      currentStreak: 0, 
      bestStreak: 0 
    };
    setHabits(prev => [...prev, duplicated]);
    addNotification("Rituel Dupliqué", `Une copie de "${habit.name}" a été créée.`, 'info');
  };

  const handleAddNewHabitAtDate = (date: string) => {
    setInitialHabitDate(date);
    setEditingHabit(null);
    setIsHabitModalOpen(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTitle = HEROIC_TITLES.find(t => t.id === stats.selectedTitleId) || HEROIC_TITLES[0];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-32 relative text-slate-900 font-sans">
      <style>{`@keyframes xpFloat { 0% { opacity:0; transform:translateY(0); } 20% { opacity:1; } 100% { opacity:0; transform:translateY(-80px); } } .xp-p { position: fixed; z-index: 99; pointer-events: none; animation: xpFloat 1.2s ease-out forwards; }`}</style>
      
      {xpPopups.map(p => (
        <div key={p.id} className="xp-p" style={{ left: `${p.x}%`, top: '40%' }}>
          <div className="bg-indigo-600 text-white font-black px-4 py-2 rounded-2xl shadow-lg">+{p.amount} XP</div>
        </div>
      ))}

      <header className="pt-12 pb-6 px-6 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => setShowNotificationCenter(true)} className="p-2 text-slate-400 relative">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>}
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-display">Lumino</h1>
          <p onClick={() => setShowTitleGallery(true)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 cursor-pointer hover:text-indigo-600">{currentTitle.name}</p>
        </div>
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg">{stats.level}</div>
      </header>

      <main className="px-6 py-8 space-y-10">
        {activeTab === 'home' && (
          <>
            <StreakCard streak={stats.streak} lastLoginDate={stats.lastLoginDate} />
            <MoodTracker onLog={logMood} lastLog={stats.moodLogs.find(l => l.date === todayStr)} />
            
            <section className="space-y-6">
              <WeeklyOverview 
                habits={habits} 
                onEdit={(h) => { setEditingHabit(h); setIsHabitModalOpen(true); }}
                onDelete={(id) => setHabits(prev => prev.filter(x => x.id !== id))}
                onDuplicate={handleDuplicateHabit}
                onAddNew={handleAddNewHabitAtDate}
                onReorder={setHabits}
                onToggle={toggleHabit}
                onShowStats={setStatHabit}
              />
            </section>
          </>
        )}

        {activeTab === 'growth' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 px-1">Espace Croissance</h2>
            <ProgressAnalytics stats={stats} habits={habits} />
            <GrowthLibrary insights={insights} />
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Programmes Guidés</h2>
              <button onClick={() => setIsChallengeModalOpen(true)} className="w-10 h-10 bg-slate-900 text-white rounded-xl shadow-xl flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></button>
            </div>
            {challenges.map(c => <ChallengeCard key={c.id} challenge={c} onCheckIn={(id) => setChallenges(prev => prev.map(x => x.id === id ? {...x, currentDay: x.currentDay + 1, lastCompletedDate: todayStr} : x))} onDelete={(id) => setChallenges(prev => prev.filter(x => x.id !== id))} onEdit={setEditingChallenge} />)}
          </div>
        )}

        {activeTab === 'focus' && <FocusTimer onSessionComplete={(m) => setStats(prev => ({ ...prev, totalFocusMinutes: prev.totalFocusMinutes + m }))} />}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 backdrop-blur-xl border border-slate-200/50 py-3 px-6 flex justify-between rounded-3xl shadow-2xl z-50">
        {[
          { id: 'home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'growth', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2' },
          { id: 'challenges', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { id: 'focus', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`p-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={tab.icon} /></svg>
          </button>
        ))}
      </nav>

      {showTitleGallery && (
        <div className="fixed inset-0 z-[100] bg-white p-8 overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center mb-10"><h3 className="text-3xl font-display">Le Panthéon</h3><button onClick={() => setShowTitleGallery(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">✕</button></div>
          <div className="grid gap-6">
            {HEROIC_TITLES.map(title => {
              const unlocked = stats.unlockedTitleIds.includes(title.id);
              return (
                <div key={title.id} className={`p-6 rounded-[2.5rem] border ${unlocked ? 'bg-white border-slate-100 shadow-xl' : 'opacity-40'}`}>
                  <h4 className="text-lg font-bold">{title.name}</h4>
                  <p className="text-[10px] text-slate-500 italic mb-4">{title.description}</p>
                  <div className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-slate-100 rounded-xl">{unlocked ? 'Éveillé ✨' : `Requis : ${title.requirementText}`}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddTaskModal 
        isOpen={isHabitModalOpen} 
        onClose={() => { setIsHabitModalOpen(false); setInitialHabitDate(null); }} 
        onAdd={(h) => setHabits(prev => [...prev, h])} 
        onUpdate={(h) => setHabits(prev => prev.map(x => x.id === h.id ? h : x))} 
        editingHabit={editingHabit}
        initialDate={initialHabitDate}
      />
      <AddChallengeModal isOpen={isChallengeModalOpen} onClose={() => setIsChallengeModalOpen(false)} onAdd={(c) => setChallenges(prev => [...prev, c])} onUpdate={(c) => setChallenges(prev => prev.map(x => x.id === c.id ? c : x))} editingChallenge={editingChallenge} />
      <HabitStatsModal habit={statHabit} isOpen={!!statHabit} onClose={() => setStatHabit(null)} />
    </div>
  );
};

export default App;
