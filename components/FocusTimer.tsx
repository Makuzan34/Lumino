
import React, { useState, useEffect } from 'react';

interface FocusTimerProps {
  session: {
    endTime: number | null;
    isActive: boolean;
    isBreak: boolean;
    duration: number;
  };
  onSessionComplete?: (minutes: number) => void;
  onSessionUpdate: (session: { endTime: number | null; isActive: boolean; isBreak: boolean; duration: number }) => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ session, onSessionComplete, onSessionUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(session.duration * 60);

  useEffect(() => {
    let interval: any;
    
    if (session.isActive && session.endTime) {
      // Periodic update logic
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((session.endTime! - now) / 1000));
        
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          handleTimerComplete();
        }
      };

      updateTimer(); // Initial call
      interval = setInterval(updateTimer, 500);
    } else {
      // Static view logic
      if (!session.isActive) {
        setTimeLeft(session.duration * 60);
      }
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [session.isActive, session.endTime, session.isBreak, session.duration]);

  const handleTimerComplete = () => {
    const wasWorkSession = !session.isBreak;
    if (wasWorkSession && onSessionComplete) {
      onSessionComplete(session.duration);
    }
    
    const nextIsBreak = !session.isBreak;
    const nextMinutes = nextIsBreak ? 5 : 25;

    onSessionUpdate({
      isActive: false,
      endTime: null,
      isBreak: nextIsBreak,
      duration: nextMinutes
    });
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(nextIsBreak ? "Session Terminée !" : "Pause Terminée !", {
        body: nextIsBreak ? "Il est temps de prendre une petite pause." : "Prêt pour une nouvelle session de focus ?",
        icon: 'https://cdn-icons-png.flaticon.com/512/3252/3252980.png'
      });
    }
  };

  const toggleTimer = () => {
    if (!session.isActive) {
      const newEndTime = Date.now() + (timeLeft * 1000);
      onSessionUpdate({
        ...session,
        endTime: newEndTime,
        isActive: true
      });
    } else {
      onSessionUpdate({
        ...session,
        endTime: null,
        isActive: false,
        duration: Math.ceil(timeLeft / 60) // Store approximate remaining minutes back
      });
    }
  };

  const resetTimer = () => {
    const defaultMins = session.isBreak ? 5 : 25;
    onSessionUpdate({
      isActive: false,
      endTime: null,
      isBreak: session.isBreak,
      duration: defaultMins
    });
    setTimeLeft(defaultMins * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
      {session.isActive && (
        <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
      )}
      
      <div className="text-center relative z-10">
        <h2 className="text-[10px] font-black mb-2 uppercase tracking-[0.3em] opacity-70">
          {session.isBreak ? 'Pause Bien-être' : 'Session de Focus'}
        </h2>
        <div className="text-7xl font-bold mb-8 font-mono tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex justify-center items-center space-x-4">
          <button 
            onClick={toggleTimer}
            className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 ${
              session.isActive 
                ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30' 
                : 'bg-white text-indigo-700 hover:bg-slate-50 shadow-xl'
            }`}
          >
            {session.isActive ? 'Suspendre' : 'Démarrer'}
          </button>
          <button 
            onClick={resetTimer}
            className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            title="Réinitialiser"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="mt-8 flex justify-center gap-6">
           <div className="text-center">
             <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Objectif</p>
             <p className="text-xs font-bold">{session.isBreak ? '5 min' : '25 min'}</p>
           </div>
           <div className="w-px h-6 bg-white/10" />
           <div className="text-center">
             <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Gain Aura</p>
             <p className="text-xs font-bold">+{session.isBreak ? '0' : '50'} XP</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
