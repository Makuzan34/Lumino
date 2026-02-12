
import React, { useMemo, useState } from 'react';
import { Habit } from '../types';

interface HabitStatsModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
}

const HabitStatsModal: React.FC<HabitStatsModalProps> = ({ habit, isOpen, onClose }) => {
  const [viewDate, setViewDate] = useState(new Date());

  if (!isOpen || !habit) return null;

  const currentMonthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const currentMonthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const monthDaysCount = currentMonthEnd.getDate();
  const firstDayIndex = currentMonthStart.getDay() === 0 ? 6 : currentMonthStart.getDay() - 1;
  
  const daysArray = Array.from({ length: monthDaysCount }, (_, i) => i + 1);

  const stats = useMemo(() => {
    const total = habit.completionHistory.length;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = habit.completionHistory.filter(d => new Date(d) >= startOfMonth).length;
    
    // Calculer le taux par rapport aux jours écoulés du mois en cours
    const daysElapsed = now.getMonth() === viewDate.getMonth() && now.getFullYear() === viewDate.getFullYear()
      ? now.getDate()
      : monthDaysCount;
      
    const rate = Math.round((thisMonthCount / daysElapsed) * 100) || 0;
    
    return { total, thisMonthCount, rate };
  }, [habit, viewDate]);

  const isDayCompleted = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = d.toISOString().split('T')[0];
    return habit.completionHistory.includes(dateStr);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + offset);
    setViewDate(newDate);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300 no-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-sm">{habit.icon}</span>
            <h2 className="text-xl font-display font-bold text-slate-900">{habit.name}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-orange-50 p-6 rounded-[2.5rem] text-center border border-orange-100 shadow-sm shadow-orange-100/20">
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 block mb-1">Streak Actuel</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-black text-orange-600">{habit.currentStreak}</span>
              <span className="text-xl">🔥</span>
            </div>
          </div>
          <div className="bg-indigo-50 p-6 rounded-[2.5rem] text-center border border-indigo-100 shadow-sm shadow-indigo-100/20">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-1">Succès Global</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-black text-indigo-600">{stats.rate}%</span>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Historique de Discipline</h3>
              <span className="text-sm font-bold text-slate-900 capitalize mt-0.5">
                {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => changeMonth(-1)} 
                className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={() => changeMonth(1)} 
                className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
            <div className="grid grid-cols-7 gap-1.5">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                <div key={d} className="text-[8px] font-black text-slate-300 text-center uppercase mb-1">{d}</div>
              ))}
              {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
              {daysArray.map(day => (
                <div 
                  key={day} 
                  className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                    isDayCompleted(day) 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                      : 'bg-white text-slate-300 border border-slate-100/50'
                  }`}
                  title={`Jour ${day}`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Personnel</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{habit.bestStreak} jours</span>
          </div>
          <div className="flex justify-between items-center px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Réalisé</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{stats.total} fois</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 mt-10 bg-slate-900 text-white rounded-[2rem] font-bold uppercase tracking-widest text-[11px] shadow-xl hover:bg-black active:scale-95 transition-all"
        >
          Terminer l'Analyse
        </button>
      </div>
    </div>
  );
};

export default HabitStatsModal;
