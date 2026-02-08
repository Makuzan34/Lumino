
import React from 'react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onEdit }) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const isOverdue = habit.dueDate && !habit.completed && new Date(habit.dueDate) < new Date(new Date().setHours(0,0,0,0));

  return (
    <div 
      className={`group flex items-center p-5 rounded-[2rem] transition-all relative border ${
        habit.completed 
          ? 'bg-slate-50 border-slate-100 opacity-60' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
      }`}
    >
      <div 
        onClick={() => onToggle(habit.id)}
        className="text-2xl mr-5 cursor-pointer select-none grayscale-[0.5] group-hover:grayscale-0 transition-all"
        role="button"
      >
        {habit.icon}
      </div>
      
      <div 
        onClick={() => onToggle(habit.id)}
        className="flex-grow cursor-pointer"
      >
        <h3 className={`font-semibold text-[15px] transition-all ${habit.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {habit.name}
        </h3>
        <div className="flex items-center space-x-3 mt-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{habit.time || 'Routine'}</span>
          {habit.dueDate && (
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-50 text-red-400' : 'bg-indigo-50 text-indigo-400'}`}>
              {formatDate(habit.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
          className="p-2 text-slate-300 hover:text-indigo-500"
          aria-label="Modifier"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
          className="p-2 text-slate-300 hover:text-red-400"
          aria-label="Supprimer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div 
        onClick={() => onToggle(habit.id)}
        className={`w-7 h-7 ml-3 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
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
  );
};

export default HabitCard;
