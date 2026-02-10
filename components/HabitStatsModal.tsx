
import React, { useMemo } from 'react';
import { Habit } from '../types';

interface HabitStatsModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
}

const HabitStatsModal: React.FC<HabitStatsModalProps> = ({ habit, isOpen, onClose }) => {
  if (!isOpen || !habit) return null;

  const currentMonth = new Date();
  const monthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: monthDays }, (_, i) => i + 1);

  const stats = useMemo(() => {
    const total = habit.completionHistory.length;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthCount = habit.completionHistory.filter(d => new Date(d) >= startOfMonth).length;
    const rate = Math.round((thisMonthCount / today.getDate()) * 100) || 0;
    
    return { total, thisMonthCount, rate };
  }, [habit]);

  const isDayCompleted = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = d.toISOString().split('T')[0];
    return habit.completionHistory.includes(dateStr);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{habit.icon}</span>
            <h2 className="text-xl font-display text-slate-900">{habit.name}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-orange-50 p-6 rounded-[2.5rem] text-center border border-orange-100">
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 block mb-1">Streak Actuel</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-black text-orange-600">{habit.currentStreak}</span>
              <span className="text-xl">🔥</span>
            </div>
          </div>
          <div className="bg-indigo-50 p-6 rounded-[2.5rem] text-center border border-indigo-100">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-1">Succès Mois</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-black text-indigo-600">{stats.rate}%</span>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heatmap de Discipline</h3>
            <span className="text-[9px] text-slate-300 capitalize">{currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
            <div className="grid grid-cols-7 gap-2">
              {daysArray.map(day => (
                <div 
                  key={day} 
                  className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold transition-all ${
                    isDayCompleted(day) 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-white text-slate-300'
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
          <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Personnel</span>
            <span className="text-xs font-bold text-slate-800">{habit.bestStreak} jours</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Réalisé</span>
            <span className="text-xs font-bold text-slate-800">{stats.total} fois</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 mt-10 bg-slate-900 text-white rounded-[2rem] font-bold uppercase tracking-widest text-[11px] shadow-xl hover:bg-black active:scale-95 transition-all"
        >
          Fermer l'Analyse
        </button>
      </div>
    </div>
  );
};

export default HabitStatsModal;
