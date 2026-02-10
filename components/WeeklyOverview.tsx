
import React, { useState, useMemo } from 'react';
import { Habit, Recurrence } from '../types';
import { shouldShowHabitOnDate } from '../App';
import HabitCard from './HabitCard';

interface WeeklyOverviewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onDuplicate: (habit: Habit) => void;
  onAddNew: (date: string) => void;
  onReorder: (habits: Habit[]) => void;
  onToggle: (id: string) => void;
  onShowStats: (habit: Habit) => void;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ habits, onEdit, onDelete, onDuplicate, onAddNew, onReorder, onToggle, onShowStats }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  const daysShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const startOfCurrentWeek = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(d.setDate(diff));
  }, []);

  const displayedWeekStart = useMemo(() => {
    const d = new Date(startOfCurrentWeek);
    d.setDate(startOfCurrentWeek.getDate() + (weekOffset * 7));
    return d;
  }, [startOfCurrentWeek, weekOffset]);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(displayedWeekStart);
    d.setDate(displayedWeekStart.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const firstDayIndex = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  
  const monthDays = useMemo(() => {
    return Array.from({ length: monthEnd.getDate() }, (_, i) => {
      return new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
    });
  }, [viewDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    const dayOfWeek = date.getDay();
    const mondayOfDate = new Date(date);
    mondayOfDate.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    mondayOfDate.setHours(0,0,0,0);
    
    const diffTime = mondayOfDate.getTime() - startOfCurrentWeek.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    setWeekOffset(Math.round(diffDays / 7));
  };

  const activeDateStr = selectedDate.toISOString().split('T')[0];
  
  const filteredHabits = useMemo(() => {
    return habits.filter(h => shouldShowHabitOnDate(h, activeDateStr));
  }, [habits, activeDateStr]);

  const habitsOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habits.filter(h => shouldShowHabitOnDate(h, dateStr));
  };

  const handleAutoSort = () => {
    const sorted = [...habits].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
    onReorder(sorted);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-500">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => showMonthGrid ? changeMonth(-1) : setWeekOffset(prev => prev - 1)} 
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded-2xl transition-all hover:bg-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={() => showMonthGrid ? changeMonth(1) : setWeekOffset(prev => prev + 1)} 
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded-2xl transition-all hover:bg-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <button 
            onClick={() => {
              if (!showMonthGrid) setViewDate(new Date(selectedDate));
              setShowMonthGrid(!showMonthGrid);
            }} 
            className="flex flex-col items-center group px-6 py-1 hover:bg-white rounded-2xl transition-all"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-0.5">
              {showMonthGrid ? 'Fermer Calendrier' : 'Plan Mensuel'}
            </span>
            <p className="text-sm font-bold text-slate-900 capitalize flex items-center gap-1">
              {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              <svg className={`w-3 h-3 transition-transform duration-300 ${showMonthGrid ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </p>
          </button>
          
          <button 
            onClick={() => { setWeekOffset(0); setSelectedDate(new Date()); setViewDate(new Date()); if(showMonthGrid) setShowMonthGrid(false); }} 
            className={`w-10 h-10 flex items-center justify-center text-[10px] font-black rounded-2xl transition-colors ${isSameDay(selectedDate, today) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-slate-500 hover:bg-white'}`}
          >
            Aujourd'hui
          </button>
        </div>

        {showMonthGrid && (
          <div className="p-6 bg-white animate-in zoom-in-95 duration-300">
            <div className="grid grid-cols-7 gap-1">
              {daysShort.map(d => <div key={d} className="text-[8px] font-black text-slate-300 text-center uppercase mb-3">{d}</div>)}
              {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
              {monthDays.map(date => {
                const isSelectedDay = isSameDay(date, selectedDate);
                const isTodayDay = isSameDay(date, today);
                const dayTasks = habitsOnDate(date);
                
                return (
                  <button 
                    key={date.toISOString()} 
                    onClick={() => handleDaySelect(date)} 
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all group ${
                      isTodayDay 
                        ? 'bg-slate-900 text-white shadow-lg scale-105 z-10' 
                        : isSelectedDay 
                        ? 'bg-indigo-600 text-white shadow-md z-10' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${isSelectedDay || isTodayDay ? '' : 'group-hover:text-indigo-600'}`}>
                      {date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        {dayTasks.slice(0, 3).map((_, idx) => (
                           <div key={idx} className={`w-1 h-1 rounded-full ${isSelectedDay || isTodayDay ? 'bg-white/60' : 'bg-indigo-400'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 flex justify-between items-center bg-white transition-opacity duration-300">
          {weekDates.map((date, i) => {
            const isSelectedDay = isSameDay(date, selectedDate);
            const isTodayDay = isSameDay(date, today);
            const dayTasks = habitsOnDate(date);

            return (
              <button 
                key={i} 
                onClick={() => setSelectedDate(date)} 
                className="flex flex-col items-center gap-1.5 group outline-none"
              >
                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isSelectedDay ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                  {daysShort[i]}
                </span>
                <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isTodayDay 
                    ? 'bg-slate-900 text-white shadow-lg ring-4 ring-slate-50' 
                    : isSelectedDay 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}>
                  <span className="text-[12px] font-bold">{date.getDate()}</span>
                  {dayTasks.length > 0 && !isSelectedDay && !isTodayDay && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-400 border-2 border-white rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm transition-all">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Planification du jour</span>
            <h3 className="text-xl font-display text-slate-900">
              {isSameDay(selectedDate, today) ? "Aujourd'hui" : selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleAutoSort} 
              className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center" 
              title="Réorganiser"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button 
              onClick={() => onAddNew(activeDateStr)} 
              className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 hover:bg-indigo-700 transition-all" 
              title="Ajouter ici"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
        
        {filteredHabits.length === 0 ? (
          <div 
            onClick={() => onAddNew(activeDateStr)}
            className="py-12 flex flex-col items-center justify-center text-slate-400 cursor-pointer border-2 border-dashed border-slate-50 rounded-[2rem] hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group"
          >
            <div className="text-3xl grayscale opacity-30 group-hover:opacity-100 group-hover:grayscale-0 transition-all mb-4">✨</div>
            <p className="text-xs italic text-center px-6">Libérez votre potentiel.<br/>Ajoutez un nouveau rituel pour ce jour.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHabits.map((habit) => (
              <HabitCard 
                key={habit.id} 
                habit={habit}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onShowStats={onShowStats}
              />
            ))}
            <button 
              onClick={() => onAddNew(activeDateStr)}
              className="w-full py-4 mt-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-300 tracking-widest hover:border-indigo-200 hover:text-indigo-400 hover:bg-indigo-50/10 transition-all"
            >
              + Ajouter un rituel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyOverview;
