
import React, { useState, useEffect, useRef } from 'react';
import { Habit, Category, AIRoutineSuggestion, Challenge, UserStats, Notification as AppNotification, HeroicTitle, Rarity } from './types';
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
import ChallengeCard from './components/ChallengeCard';
import { getDailyWellnessTip, suggestRoutine } from './services/geminiService';

const Wings: React.FC<{ rarity: Rarity, className?: string }> = ({ rarity, className }) => {
  const color = rarity === 'legendary' ? '#f59e0b' : rarity === 'epic' ? '#8b5cf6' : rarity === 'rare' ? '#3b82f6' : '#94a3b8';
  return (
    <svg viewBox="0 0 100 60" className={`absolute transition-all duration-700 pointer-events-none ${className}`}>
      <path d="M50 40 Q40 10 0 20 Q10 40 45 45 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" className={rarity !== 'common' ? 'animate-pulse' : ''} />
      <path d="M50 40 Q60 10 100 20 Q90 40 55 45 Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" className={rarity !== 'common' ? 'animate-pulse' : ''} />
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
      unlockedTitleIds: ['t1'],
      selectedTitleId: 't1',
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

  const [wellnessTip, setWellnessTip] = useState<string>('Chargement du conseil...');
  const [aiGoal, setAiGoal] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AIRoutineSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'focus' | 'challenges' | 'ai'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [xpPopups, setXpPopups] = useState<{id: string, amount: number, x: number}[]>([]);
  const [showQuestLibrary, setShowQuestLibrary] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showTitleGallery, setShowTitleGallery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const checkTitleUnlocks = () => {
    const newlyUnlocked: string[] = [];
    HEROIC_TITLES.forEach(title => {
      if (!stats.unlockedTitleIds.includes(title.id) && title.condition(stats)) {
        newlyUnlocked.push(title.id);
        addNotification("Titre Débloqué !", `"${title.name}" est à vous !`, 'level');
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
    addXp(bonusXp, `Série de ${newStreak} jours`);
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
        addNotification("Nouveau Niveau !", `Niveau ${newLevel} : ${GET_RANK(newLevel)}`, 'level');
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
    ctx.fillStyle = 'rgba(79, 70, 229, 0.1)';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 60px Inter';
    ctx.fillText('SUCCÈS LUMINO', 540, 600);
    
    ctx.font = 'bold 120px Playfair Display';
    ctx.fillStyle = title.rarity === 'legendary' ? '#f59e0b' : '#ffffff';
    ctx.fillText(title.name.toUpperCase(), 540, 960);

    ctx.font = '40px Inter';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(title.description, 540, 1040);

    ctx.font = 'bold 50px Inter';
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`NIVEAU ${stats.level} - ${GET_RANK(stats.level)}`, 540, 1200);

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
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-24 relative overflow-x-hidden border-x border-slate-100 shadow-2xl">
      <canvas ref={canvasRef} width="1080" height="1920" className="hidden" />
      
      <style>{`
        @keyframes xpFloat { 0% { opacity:0; transform:translateY(0); } 20% { opacity:1; } 100% { opacity:0; transform:translateY(-100px); } }
        .xp-p { position: fixed; z-index: 99; pointer-events: none; animation: xpFloat 1.5s ease-out forwards; }
        .wing-anim { transform-origin: center; animation: wingMove 3.5s ease-in-out infinite; }
        @keyframes wingMove { 0%, 100% { transform: scale(1) translate(-50%, -50%); } 50% { transform: scale(1.15) translate(-48%, -52%) rotate(3deg); } }
      `}</style>

      {xpPopups.map(p => (
        <div key={p.id} className="xp-p" style={{ left: `${p.x}%`, top: '40%' }}>
          <div className="bg-yellow-400 text-yellow-900 font-black px-4 py-2 rounded-full shadow-lg">+{p.amount} XP</div>
        </div>
      ))}

      <header className="px-6 pt-12 pb-8 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm overflow-hidden">
        {/* Actions Secondaires (Notification & Niveau) */}
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-20">
          <button onClick={() => setShowNotificationCenter(true)} className="w-10 h-10 bg-slate-50/80 backdrop-blur rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg">
            {stats.level}
          </div>
        </div>

        {/* Élément Central avec Ailes */}
        <div className="flex flex-col items-center justify-center mt-4 mb-6 relative py-10">
          <div onClick={() => setShowTitleGallery(true)} className="cursor-pointer relative z-10 text-center flex flex-col items-center">
            {/* Ailes centrées derrière le texte */}
            <Wings 
              rarity={currentTitle.rarity} 
              className="w-56 h-56 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70 wing-anim -z-10" 
            />
            
            <h1 className="text-4xl font-display text-slate-900 drop-shadow-sm tracking-tight">Lumino</h1>
            <div className="mt-2 flex flex-col items-center">
              <span className={`text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1 rounded-full border ${currentTitle.rarity === 'legendary' ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-slate-400 border-slate-100 bg-slate-50'}`}>
                {currentTitle.name}
              </span>
              <p className="text-indigo-600 text-[9px] font-black mt-2 uppercase tracking-widest opacity-80">{GET_RANK(stats.level)}</p>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
          <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${levelProgress}%` }} />
        </div>
        
        <div className="p-3 bg-indigo-50/40 rounded-2xl mt-6 border border-indigo-100/50">
          <p className="text-indigo-900 text-[11px] italic text-center leading-relaxed">"{wellnessTip}"</p>
        </div>
      </header>

      <main className="px-6 py-8">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-800">Ma Routine</h2>
               <button onClick={() => setIsModalOpen(true)} className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-md transition-transform active:scale-90">+</button>
            </div>
            {habits.length === 0 ? (
              <div className="py-20 text-center text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <p className="italic">Aucune habitude prévue.</p>
              </div>
            ) : (
              habits.map(h => (
                <HabitCard key={h.id} habit={h} onToggle={toggleHabit} onDelete={(id) => setHabits(habits.filter(x => x.id !== id))} onEdit={setEditingHabit} />
              ))
            )}
          </div>
        )}

        {activeTab === 'focus' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Zone Focus</h2>
            <FocusTimer onSessionComplete={(m) => setStats(s => ({ ...s, totalFocusMinutes: s.totalFocusMinutes + m }))} />
          </div>
        )}
        
        {activeTab === 'challenges' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-slate-800">Grimoire Ancien</h2>
               <button onClick={() => setShowQuestLibrary(true)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm transition-all hover:bg-indigo-100">Ouvrir le Grimoire</button>
             </div>
             {challenges.length === 0 ? (
               <div className="py-20 text-center text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                 <p className="italic">Choisissez une épreuve dans le grimoire.</p>
               </div>
             ) : (
               challenges.map(c => <ChallengeCard key={c.id} challenge={c} onDelete={(id) => setChallenges(challenges.filter(x => x.id !== id))} onCheckIn={(id) => {
                 setChallenges(challenges.map(x => x.id === id ? { ...x, currentDay: x.currentDay + 1, lastCompletedDate: new Date().toISOString().split('T')[0] } : x));
                 addXp(XP_PER_CHALLENGE_DAY, c.title);
               }} />)
             )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">L'Oracle Gemini</h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">L'IA forge votre routine selon vos désirs profonds.</p>
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={aiGoal} 
                onChange={(e) => setAiGoal(e.target.value)} 
                placeholder="Ex: Apprendre à peindre le soir..." 
                className="flex-grow p-5 bg-white rounded-3xl border border-slate-200 focus:border-indigo-500 outline-none transition-all shadow-sm" 
              />
              <button 
                onClick={async () => {
                  if(!aiGoal) return;
                  setIsLoading(true);
                  const suggs = await suggestRoutine(aiGoal);
                  setAiSuggestions(suggs);
                  setIsLoading(false);
                }} 
                className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl active:scale-95 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </div>
            {isLoading ? (
              <div className="py-12 text-center animate-pulse text-indigo-600 font-black tracking-widest text-sm">L'ORACLE CONSULTE LES ASTRES...</div>
            ) : (
              aiSuggestions.map((s, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-indigo-50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="text-3xl">{s.icon}</span>
                    <h4 className="font-bold text-slate-800">{s.activity}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">{s.benefit}</p>
                  <button onClick={() => {
                    const h: Habit = { id: crypto.randomUUID(), name: s.activity, category: Category.MORNING, completed: false, time: s.time, dueDate: null, icon: s.icon };
                    setHabits([...habits, h]);
                    addNotification("Quête Forgée", `"${s.activity}" a été ajoutée à votre routine.`, 'quest');
                  }} className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 w-full py-3 rounded-2xl border border-indigo-100">Graver dans le destin</button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Galerie des Titres */}
      {showTitleGallery && (
        <div className="fixed inset-0 z-[100] bg-slate-900/85 backdrop-blur-2xl p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-10 sticky top-0 bg-transparent pt-4 pb-2 z-10">
            <div>
              <h3 className="text-3xl font-display text-white">Le Panthéon</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Vos ailes de pouvoir</p>
            </div>
            <button onClick={() => setShowTitleGallery(false)} className="w-12 h-12 flex items-center justify-center text-white text-3xl hover:rotate-90 transition-all">✕</button>
          </div>
          <div className="grid gap-5 pb-10">
            {HEROIC_TITLES.map(title => {
              const unlocked = stats.unlockedTitleIds.includes(title.id);
              const active = stats.selectedTitleId === title.id;
              return (
                <div key={title.id} className={`p-7 rounded-[2.5rem] border transition-all ${unlocked ? 'bg-white border-white shadow-2xl scale-100' : 'bg-slate-800/40 border-slate-700 opacity-50 scale-95'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${title.rarity === 'legendary' ? 'text-amber-500' : title.rarity === 'epic' ? 'text-purple-500' : title.rarity === 'rare' ? 'text-blue-500' : 'text-slate-400'}`}>{title.rarity}</span>
                    {unlocked && (
                      <button onClick={() => handleDownloadAchievement(title)} className="text-slate-300 hover:text-indigo-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{title.name}</h4>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">{title.description}</p>
                  {unlocked && !active && (
                    <button onClick={() => setStats(prev => ({ ...prev, selectedTitleId: title.id }))} className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95">Déployer les Ailes</button>
                  )}
                  {active && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center bg-indigo-50 py-3.5 rounded-2xl border border-indigo-100"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-full mr-3 animate-ping"></span> Actuel</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grimoire Ancien (Choix des quêtes) */}
      {showQuestLibrary && (
        <div className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-xl flex items-end animate-in fade-in duration-300">
          <div className="bg-white w-full h-[85vh] rounded-t-[3.5rem] p-10 overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-500 border-t border-slate-100">
            <div className="flex justify-between items-center mb-10 sticky top-0 bg-white py-4 z-10 border-b border-slate-50">
              <div>
                <h3 className="text-3xl font-display text-slate-900">Grimoire des Épreuves</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Forgez votre légende</p>
              </div>
              <button onClick={() => setShowQuestLibrary(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">✕</button>
            </div>
            <div className="grid gap-6 pb-20">
              {QUEST_LIBRARY.map((quest, idx) => {
                const isActive = challenges.some(c => c.title === quest.title);
                return (
                  <div key={idx} className={`p-5 rounded-[2rem] border border-slate-100 flex items-center group transition-all ${isActive ? 'opacity-30 grayscale pointer-events-none' : 'hover:border-indigo-200 hover:bg-indigo-50/20'}`}>
                    <div className={`w-14 h-14 ${quest.color} rounded-2xl flex items-center justify-center text-3xl text-white mr-5 shadow-lg shadow-indigo-100`}>{quest.icon}</div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-800 text-base">{quest.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{quest.description} • <span className="text-indigo-600">{quest.duration} jours</span></p>
                    </div>
                    <button 
                      onClick={() => {
                        setChallenges([...challenges, { ...quest, id: crypto.randomUUID(), currentDay: 0 }]);
                        setShowQuestLibrary(false);
                        addNotification("Nouvelle Épreuve", `Vous avez accepté le défi : ${quest.title}`, 'quest');
                      }} 
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-5 py-3 bg-indigo-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >Accepter</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {showNotificationCenter && (
        <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-md flex justify-end animate-in fade-in duration-300" onClick={() => setShowNotificationCenter(false)}>
          <div className="bg-white w-full max-w-[340px] h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold text-slate-900">Archives</h3>
              <button onClick={() => setShowNotificationCenter(false)} className="p-3 bg-slate-50 rounded-xl text-slate-400">✕</button>
            </div>
            <div className="space-y-5">
              {notifications.length === 0 ? (
                <div className="py-24 text-center text-slate-400 text-sm italic font-medium">Votre histoire commence ici...</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden group">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${n.type === 'level' ? 'bg-amber-400' : 'bg-indigo-500'}`}></div>
                    <h4 className="font-black text-slate-800 text-[11px] mb-1 uppercase tracking-tight">{n.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{n.message}</p>
                    <span className="text-[8px] text-slate-300 block mt-3 font-bold">{new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100 p-6 flex justify-between max-w-md mx-auto z-40 rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <button onClick={() => setActiveTab('home')} className={`p-3.5 rounded-2xl transition-all ${activeTab === 'home' ? 'text-indigo-600 bg-indigo-50 shadow-inner scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button onClick={() => setActiveTab('challenges')} className={`p-3.5 rounded-2xl transition-all ${activeTab === 'challenges' ? 'text-indigo-600 bg-indigo-50 shadow-inner scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </button>
        <button onClick={() => setActiveTab('focus')} className={`p-3.5 rounded-2xl transition-all ${activeTab === 'focus' ? 'text-indigo-600 bg-indigo-50 shadow-inner scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
        <button onClick={() => setActiveTab('ai')} className={`p-3.5 rounded-2xl transition-all ${activeTab === 'ai' ? 'text-indigo-600 bg-indigo-50 shadow-inner scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
      </nav>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={(h) => setHabits([...habits, h])} onUpdate={(h) => setHabits(habits.map(x => x.id === h.id ? h : x))} editingHabit={editingHabit} />
    </div>
  );
};

export default App;
