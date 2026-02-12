
import React, { useState, useEffect, useMemo } from 'react';
import { Habit, Category, Challenge, UserStats, Notification as AppNotification, HeroicTitle, Rarity, Difficulty, Recurrence, GrowthInsight, MoodLog } from './types';
import { 
  DEFAULT_HABITS, 
  DEFAULT_CHALLENGES, 
  HABIT_XP_VALUES,
  MAX_LEVEL,
  HEROIC_TITLES,
  DAILY_QUOTES
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
  
  // Persistence for Focus Timer state
  const [timerSession, setTimerSession] = useState<{ 
    endTime: number | null; 
    isActive: boolean; 
    isBreak: boolean; 
    duration: number; 
  }>(() => {
    const saved = localStorage.getItem('lumino_timer');
    return saved ? JSON.parse(saved) : { endTime: null, isActive: false, isBreak: false, duration: 25 };
  });

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
  const [showLevelInfo, setShowLevelInfo] = useState(false);

  useEffect(() => { localStorage.setItem('lumino_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('lumino_challenges', JSON.stringify(challenges)); }, [challenges]);
  useEffect(() => { localStorage.setItem('lumino_stats', JSON.stringify(stats)); checkTitleUnlocks(); }, [stats]);
  useEffect(() => { localStorage.setItem('lumino_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('lumino_insights', JSON.stringify(insights)); }, [insights]);
  useEffect(() => { localStorage.setItem('lumino_timer', JSON.stringify(timerSession)); }, [timerSession]);

  useEffect(() => {
    const init = async () => {
      const tip = await getDailyWellnessTip();
      setWellnessTip(tip);
      
      const today = new Date().toISOString().split('T')[0];
      if (stats.lastRefreshDate !== today) {
        const newInsight = await getGrowthInsight();
        if (!insights.find(i => i.id === newInsight.id)) {
          setInsights(prev => [newInsight, ...prev].slice(0, 20));
        }
        setStats(prev => ({ ...prev, lastRefreshDate: today }));
      }
    };
    init();
    checkDailyLogin();
  }, [stats.lastRefreshDate]);

  const checkDailyLogin = () => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastLoginDate === today) return;
    let newStreak = 1;
    if (stats.lastLoginDate) {
      const last = new Date(stats.lastLoginDate);
      const curr = new Date(today);
      const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) newStreak = stats.streak + 1;
    }
    setStats(prev => ({ ...prev, streak: newStreak, lastLoginDate: today }));
    addXp(20 + (newStreak * 2));
  };

  const checkTitleUnlocks = () => {
    const newlyUnlocked: string[] = [];
    HEROIC_TITLES.forEach(title => {
      if (!stats.unlockedTitleIds.includes(title.id) && title.condition(stats)) {
        newlyUnlocked.push(title.id);
        addNotification('Nouveau Titre Débloqué !', `Vous avez débloqué le titre : ${title.name}`, 'level');
      }
    });
    if (newlyUnlocked.length > 0) {
      setStats(prev => ({ ...prev, unlockedTitleIds: [...prev.unlockedTitleIds, ...newlyUnlocked] }));
    }
  };

  const addXp = (amount: number) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let totalXp = prev.totalXp + amount;
      
      let xpNeeded = newLevel * 100;
      while (newXp >= xpNeeded && newLevel < MAX_LEVEL) {
        newXp -= xpNeeded;
        newLevel++;
        xpNeeded = newLevel * 100;
        addNotification('Niveau Supérieur !', `Vous avez atteint le niveau ${newLevel}. Félicitations !`, 'level');
      }
      
      return { ...prev, xp: Math.max(0, newXp), level: newLevel, totalXp };
    });
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: crypto.randomUUID(),
      title,
      message,
      timestamp: Date.now(),
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 30));
  };

  const handleToggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isCurrentlyCompleted = h.completed;
        let newHistory = [...h.completionHistory];
        
        if (!isCurrentlyCompleted) {
          if (!newHistory.includes(today)) {
            newHistory.push(today);
            addXp(HABIT_XP_VALUES[h.difficulty]);
            setStats(s => ({ ...s, totalHabitsCompleted: s.totalHabitsCompleted + 1 }));
          }
        } else {
          newHistory = newHistory.filter(d => d !== today);
        }
        
        const streak = calculateStreak(newHistory);
        return { 
          ...h, 
          completed: !isCurrentlyCompleted, 
          completionHistory: newHistory,
          currentStreak: streak,
          bestStreak: Math.max(h.bestStreak, streak)
        };
      }
      return h;
    }));
  };

  const handleCheckInChallenge = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setChallenges(prev => prev.map(c => {
      if (c.id === id && c.lastCompletedDate !== today && c.currentDay < c.duration) {
        const newDay = c.currentDay + 1;
        const isFinished = newDay === c.duration;
        addXp(isFinished ? 500 : 50);
        if (isFinished) {
           setStats(s => ({ ...s, totalChallengesCompleted: s.totalChallengesCompleted + 1 }));
           addNotification('Quête Terminée !', `Félicitations, vous avez fini ${c.title}.`, 'quest');
        }
        return { ...c, currentDay: newDay, lastCompletedDate: today };
      }
      return c;
    }));
  };

  const handleAddHabit = (h: Habit) => {
    setHabits(prev => [...prev, h]);
    setIsHabitModalOpen(false);
  };

  const handleUpdateHabit = (h: Habit) => {
    setHabits(prev => prev.map(old => old.id === h.id ? h : old));
    setEditingHabit(null);
    setIsHabitModalOpen(false);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleMoodLog = (mood: number, energy: number) => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.moodLogs.some(l => l.date === today)) return;
    
    setStats(prev => ({
      ...prev,
      moodLogs: [...prev.moodLogs, { date: today, mood, energy }].slice(-30),
      totalXp: prev.totalXp + 10
    }));
    addXp(10);
    addNotification('Aura Enregistrée', 'Merci d\'avoir partagé vos vibrations du jour.', 'xp');
  };

  const handleFocusComplete = (minutes: number) => {
    setStats(prev => ({ ...prev, totalFocusMinutes: prev.totalFocusMinutes + minutes }));
    addXp(minutes * 2);
    addNotification('Focus Accomplie', `Vous avez gagné ${minutes * 2} XP pour votre séance de concentration.`, 'xp');
  };

  const handleDuplicateHabit = (habit: Habit) => {
    const newHabit = { ...habit, id: crypto.randomUUID(), completionHistory: [], currentStreak: 0, bestStreak: 0, completed: false };
    setHabits(prev => [...prev, newHabit]);
  };

  const selectTitle = (titleId: string) => {
    if (stats.unlockedTitleIds.includes(titleId)) {
      setStats(prev => ({ ...prev, selectedTitleId: titleId }));
      setShowTitleGallery(false);
      addNotification('Identité Mise à Jour', `Vous portez désormais le titre de : ${HEROIC_TITLES.find(t => t.id === titleId)?.name}`, 'info');
    }
  };

  const handleMarkInsightLearned = (id: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, read: !insight.read } : insight
    ));
    // Reward learning with a small amount of XP if marking as learned (read = true)
    const insight = insights.find(i => i.id === id);
    if (insight && !insight.read) {
      addXp(25);
      addNotification('Sagesse Intégrée', 'Vous avez acquis de nouvelles connaissances (+25 XP)', 'xp');
    }
  };

  const currentRankName = useMemo(() => {
    const title = HEROIC_TITLES.find(t => t.id === stats.selectedTitleId);
    return title ? title.name : 'Aventurier de Lumino';
  }, [stats.selectedTitleId]);

  const xpToNextLevel = stats.level * 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 relative">
      <header className="bg-white border-b border-slate-100 p-6 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 font-display text-2xl">L</div>
            <div>
              <h1 className="text-xl font-display font-bold">Lumino</h1>
              <p onClick={() => setShowTitleGallery(true)} className="text-[10px] text-indigo-500 font-black uppercase tracking-widest cursor-pointer hover:underline">
                {currentRankName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowNotificationCenter(!showNotificationCenter)} className="relative p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              🔔
              {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
            </button>
            <div onClick={() => setShowLevelInfo(true)} className="flex flex-col items-end cursor-pointer group">
              <span className="text-xs font-bold group-hover:text-indigo-600">NV {stats.level}</span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(stats.xp / xpToNextLevel) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center min-h-[80px]">
            <p className="text-[11px] italic text-slate-500 leading-relaxed text-center">"{wellnessTip}"</p>
          </div>
          <StreakCard streak={stats.streak} lastLoginDate={stats.lastLoginDate} />
        </div>

        <nav className="flex gap-2 p-1.5 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          {(['home', 'growth', 'challenges', 'focus'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'home' ? 'Rituels' : tab === 'growth' ? 'Sagesse' : tab === 'challenges' ? 'Quêtes' : 'Focus'}
            </button>
          ))}
        </nav>

        {activeTab === 'home' && (
          <div className="space-y-6">
            <MoodTracker onLog={handleMoodLog} lastLog={stats.moodLogs.find(l => l.date === new Date().toISOString().split('T')[0])} />
            <WeeklyOverview 
              habits={habits} 
              onEdit={(h) => { setEditingHabit(h); setIsHabitModalOpen(true); }}
              onDelete={handleDeleteHabit}
              onDuplicate={handleDuplicateHabit}
              onAddNew={(date) => { setInitialHabitDate(date); setIsHabitModalOpen(true); }}
              onReorder={setHabits}
              onToggle={handleToggleHabit}
              onShowStats={setStatHabit}
            />
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="space-y-6">
            <ProgressAnalytics stats={stats} habits={habits} />
            <GrowthLibrary 
              insights={insights} 
              onMarkLearned={handleMarkInsightLearned}
            />
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center px-2">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vos Grandes Épreuves</h3>
               <button onClick={() => setIsChallengeModalOpen(true)} className="text-xs font-bold text-indigo-600">+ Nouvelle Quête</button>
             </div>
             {challenges.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic bg-white rounded-[3rem] border border-dashed border-slate-100">Aucune quête en cours...</div>
             ) : (
               challenges.map(c => (
                 <ChallengeCard 
                   key={c.id} 
                   challenge={c} 
                   onCheckIn={handleCheckInChallenge} 
                   onDelete={(id) => setChallenges(prev => prev.filter(x => x.id !== id))}
                   onEdit={(ch) => { setEditingChallenge(ch); setIsChallengeModalOpen(true); }}
                 />
               ))
             )}
          </div>
        )}

        {activeTab === 'focus' && (
          <div className="space-y-6">
            <FocusTimer 
              session={timerSession}
              onSessionComplete={handleFocusComplete} 
              onSessionUpdate={setTimerSession}
            />
          </div>
        )}
      </main>

      {/* Modal d'informations de Niveau */}
      {showLevelInfo && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-display font-bold">Niveau de Conscience</h3>
               <button onClick={() => setShowLevelInfo(false)} className="text-slate-400">✕</button>
             </div>
             
             <div className="text-center mb-8">
                <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 mb-4 border-4 border-indigo-50">
                  {stats.level}
                </div>
                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-1">XP Total Accumulé</p>
                <p className="text-xl font-bold">{stats.totalXp} XP</p>
             </div>

             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                   <span>Progression NV {stats.level}</span>
                   <span>{stats.xp} / {xpToNextLevel} XP</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600" style={{ width: `${(stats.xp / xpToNextLevel) * 100}%` }} />
                 </div>
                 <p className="text-[10px] text-center text-slate-400 mt-2">Plus que <span className="text-indigo-600 font-bold">{xpToNextLevel - stats.xp} XP</span> pour le niveau {stats.level + 1}</p>
               </div>
             </div>

             <button onClick={() => setShowLevelInfo(false)} className="w-full py-4 mt-8 bg-slate-900 text-white rounded-[2rem] font-bold uppercase tracking-widest text-[11px]">
               Retour à la mission
             </button>
           </div>
        </div>
      )}

      {/* Galerie des Titres */}
      {showTitleGallery && (
        <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-500 p-8">
           <div className="max-w-2xl mx-auto">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-display font-bold">Panthéon des Titres</h2>
               <button onClick={() => setShowTitleGallery(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-xl font-bold">✕</button>
             </div>
             
             <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-8">Débloquez votre identité héroïque</p>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
               {HEROIC_TITLES.map((title) => {
                 const isUnlocked = stats.unlockedTitleIds.includes(title.id);
                 const isSelected = stats.selectedTitleId === title.id;
                 
                 return (
                   <div 
                     key={title.id}
                     onClick={() => isUnlocked && selectTitle(title.id)}
                     className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer relative group ${
                       isSelected 
                       ? 'bg-indigo-600 border-indigo-600 shadow-xl text-white' 
                       : isUnlocked 
                       ? 'bg-white border-slate-100 shadow-sm hover:border-indigo-200' 
                       : 'bg-slate-50 border-transparent opacity-40 grayscale'
                     }`}
                   >
                     <div className="flex justify-between items-start mb-2">
                       <h4 className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{title.name}</h4>
                       {isSelected && <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-1 rounded-lg">Actif</span>}
                     </div>
                     <p className={`text-[10px] mb-4 leading-relaxed ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                       {title.description}
                     </p>
                     <div className={`text-[9px] font-black uppercase tracking-widest py-2 rounded-xl text-center ${
                       isSelected ? 'bg-white/10' : isUnlocked ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'
                     }`}>
                       {isUnlocked ? 'Titre Éveillé ✨' : `Requis : ${title.requirementText}`}
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>
      )}

      <AddTaskModal 
        isOpen={isHabitModalOpen} 
        onClose={() => { setIsHabitModalOpen(false); setEditingHabit(null); setInitialHabitDate(null); }} 
        onAdd={handleAddHabit} 
        onUpdate={handleUpdateHabit} 
        editingHabit={editingHabit}
        initialDate={initialHabitDate}
      />

      <AddChallengeModal 
        isOpen={isChallengeModalOpen} 
        onClose={() => { setIsChallengeModalOpen(false); setEditingChallenge(null); }} 
        onAdd={(c) => setChallenges(prev => [...prev, c])} 
        onUpdate={(c) => setChallenges(prev => prev.map(old => old.id === c.id ? c : old))} 
        editingChallenge={editingChallenge}
      />

      <HabitStatsModal 
        isOpen={!!statHabit} 
        habit={statHabit} 
        onClose={() => setStatHabit(null)} 
      />

      {showNotificationCenter && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex justify-end p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Journal des Hérauts</h2>
              <button onClick={() => setShowNotificationCenter(false)} className="text-slate-400 text-2xl">✕</button>
            </div>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-12">Le silence règne dans votre royaume.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">{n.type}</p>
                    <h4 className="font-bold text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
