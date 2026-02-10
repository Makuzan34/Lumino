
import React, { useState } from 'react';
import { Habit, Recurrence, Difficulty } from '../types';
import { HABIT_XP_VALUES, DIFFICULTY_LABELS } from '../constants';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onShowStats?: (habit: Habit) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onEdit, onShowStats }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const isOverdue = habit.dueDate && !habit.completed && new Date(habit.dueDate) < new Date(new Date().setHours(0,0,0,0));
  const xpValue = HABIT_XP_VALUES[habit.difficulty || Difficulty.MEDIUM];

  const getRecurrenceIcon = (rec: Recurrence) => {
    switch (rec) {
      case Recurrence.DAILY: return '🔄';
      case Recurrence.WEEKLY: return '📅';
      case Recurrence.MONTHLY: return '🌙';
      default: return null;
    }
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.EASY: return 'text-emerald-500';
      case Difficulty.MEDIUM: return 'text-indigo-500';
      case Difficulty.HARD: return 'text-amber-500';
      case Difficulty.HEROIC: return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div 
      className={`group flex flex-col p-4 rounded-[2rem] transition-all relative border ${
        habit.completed 
          ? 'bg-slate-50 border-slate-100 opacity-80' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start w-full">
        <div 
          onClick={() => onToggle(habit.id)}
          className="text-2xl mr-4 cursor-pointer select-none grayscale-[0.5] hover:grayscale-0 transition-all pt-1"
          role="button"
        >
          {habit.icon}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between gap-2" onClick={() => onToggle(habit.id)}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-[15px] transition-all cursor-pointer ${habit.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {habit.name}
                </h3>
                {habit.currentStreak > 0 && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-50 rounded-lg text-orange-600">
                    <span className="text-[10px] font-black">{habit.currentStreak}</span>
                    <span className="text-[10px]">🔥</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-black uppercase tracking-widest ${getDifficultyColor(habit.difficulty)}`}>
                  {DIFFICULTY_LABELS[habit.difficulty]}
                </span>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{habit.time}</span>
              </div>
            </div>
            {!habit.completed && (
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0">
                +{xpValue} XP
              </span>
            )}
          </div>
          
          {(isExpanded || isOverdue) && !habit.completed && (
            <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {habit.description && (
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  {habit.description}
                </p>
              )}
              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-tight">{habit.time || 'Routine'}</span>
                {habit.dueDate && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-50 text-red-400' : 'bg-indigo-50 text-indigo-400'}`}>
                    Échéance: {formatDate(habit.dueDate)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 ml-2">
           <button
            onClick={() => onShowStats?.(habit)}
            className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
            title="Statistiques"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
            </svg>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 text-slate-300 hover:text-indigo-500 transition-all ${isExpanded ? 'rotate-180' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="hidden group-hover:flex items-center space-x-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
              className="p-2 text-slate-300 hover:text-indigo-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
              className="p-2 text-slate-300 hover:text-red-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div 
            onClick={() => onToggle(habit.id)}
            className={`w-7 h-7 ml-1 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
              habit.completed ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-200'
            }`}
          >
            {habit.completed && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
