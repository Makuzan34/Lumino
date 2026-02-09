
import React, { useState } from 'react';
import { Habit, Recurrence } from '../types';

interface WeeklyOverviewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onDuplicate: (habit: Habit) => void;
  onAddNew: (date: string) => void;
  onReorder: (habits: Habit[]) => void;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ habits, onEdit, onDelete, onDuplicate, onAddNew, onReorder }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  
  const currentDay = today.getDay();
  const startOfCurrentWeek = new Date(new Date().setHours(0,0,0,0));
  startOfCurrentWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  const displayedWeekStart = new Date(startOfCurrentWeek);
  displayedWeekStart.setDate(startOfCurrentWeek.getDate() + (weekOffset * 7));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(displayedWeekStart);
    d.setDate(displayedWeekStart.getDate() + i);
    return d;
  });

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return date.getDate() === now.getDate() && 
           date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const monthStart = new Date(displayedWeekStart.getFullYear(), displayedWeekStart.getMonth(), 1);
  const monthEnd = new Date(displayedWeekStart.getFullYear(), displayedWeekStart.getMonth() + 1, 0);
  const monthDays = Array.from({ length: monthEnd.getDate() }, (_, i) => {
    return new Date(displayedWeekStart.getFullYear(), displayedWeekStart.getMonth(), i + 1);
  });

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    if (showMonthGrid) {
        const dayOfWeek = date.getDay();
        const mondayOfDate = new Date(date);
        mondayOfDate.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        mondayOfDate.setHours(0,0,0,0);
        const offsetInDays = (mondayOfDate.getTime() - startOfCurrentWeek.getTime()) / (1000 * 3600 * 24);
        setWeekOffset(Math.round(offsetInDays / 7));
    }
  };

  const activeDateStr = selectedDate.toISOString().split('T')[0];
  const filteredHabits = habits.filter(h => {
    if (h.dueDate === activeDateStr) return true;
    if (!h.dueDate && h.recurrence === Recurrence.DAILY) return true;
    return false;
  });

  // Reorder logic for drag and drop
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId === id) return;
    const items = [...habits];
    const draggedIdx = items.findIndex(h => h.id === draggedId);
    const overIdx = items.findIndex(h => h.id === id);
    const [draggedItem] = items.splice(draggedIdx, 1);
    items.splice(overIdx, 0, draggedItem);
    onReorder(items);
  };
  const handleDrop = () => setDraggedId(null);

  const handleAutoSort = () => {
    const sorted = [...habits].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    onReorder(sorted);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(prev => prev - 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setWeekOffset(prev => prev + 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <button onClick={() => setShowMonthGrid(!showMonthGrid)} className="flex flex-col items-center group px-4 py-1 hover:bg-slate-50 rounded-2xl transition-all">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-0.5">Calendrier</span>
            <p className="text-sm font-bold text-slate-900 capitalize flex items-center gap-1">
              {formatMonth(displayedWeekStart)}
              <svg className={`w-3 h-3 transition-transform ${showMonthGrid ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </p>
          </button>
          <button onClick={() => { setWeekOffset(0); setSelectedDate(new Date()); }} className={`w-10 h-10 flex items-center justify-center text-[10px] font-black rounded-full ${isToday(selectedDate) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}>Auj.</button>
        </div>

        {showMonthGrid && (
          <div className="p-6 bg-slate-50/30 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-7 gap-1">
              {days.map(d => <div key={d} className="text-[8px] font-black text-slate-300 text-center uppercase mb-2">{d}</div>)}
              {Array.from({ length: (monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1) }).map((_, i) => <div key={`empty-${i}`} />)}
              {monthDays.map(date => (
                <button key={date.toISOString()} onClick={() => handleDaySelect(date)} className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${isToday(date) ? 'bg-indigo-600 text-white shadow-md' : isSelected(date) ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200' : 'text-slate-600 hover:bg-indigo-50'}`}>{date.getDate()}</button>
              ))}
            </div>
          </div>
        )}

        {!showMonthGrid && (
          <div className="p-4 flex justify-between items-center bg-white">
            {weekDates.map((date, i) => (
              <button key={i} onClick={() => handleDaySelect(date)} className="flex flex-col items-center gap-1 group">
                <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected(date) ? 'text-indigo-600' : 'text-slate-300'}`}>{days[i]}</span>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${isToday(date) ? 'bg-slate-900 text-white' : isSelected(date) ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}><span className="text-[11px] font-bold">{date.getDate()}</span></div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2"><span>📜</span> Rituels du {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAutoSort} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors" title="Réorganiser par heure">
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button onClick={() => onAddNew(activeDateStr)} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 hover:bg-black" title="Ajouter un rituel">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
        
        {filteredHabits.length === 0 ? (
          <div className="py-16 text-center text-slate-400 italic text-xs">Aucun rituel consigné.</div>
        ) : (
          <div className="space-y-3">
            {filteredHabits.map((habit) => (
              <div 
                key={habit.id} 
                draggable 
                onDragStart={() => handleDragStart(habit.id)} 
                onDragOver={(e) => handleDragOver(e, habit.id)} 
                onDrop={handleDrop}
                className={`flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group cursor-grab active:cursor-grabbing ${draggedId === habit.id ? 'opacity-20 scale-95 border-dashed border-indigo-400' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-200 group-hover:text-slate-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" /></svg>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">{habit.icon}</div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{habit.name}</h4>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">{habit.time} • {habit.recurrence === 'NONE' ? 'Unique' : 'Quotidien'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => onDuplicate(habit)} className="p-2 text-slate-400 hover:text-emerald-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></button>
                  <button onClick={() => onEdit(habit)} className="p-2 text-slate-400 hover:text-indigo-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => onDelete(habit.id)} className="p-2 text-slate-400 hover:text-red-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-indigo-50/40 rounded-[2.5rem] border border-indigo-100/50 text-center italic text-[10px] text-indigo-400">"Maîtrisez votre temps, forgez votre légende."</div>
    </div>
  );
};

export default WeeklyOverview;
