
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
      className={`group flex items-center p-4 mb-3 rounded-2xl transition-all border relative ${
        habit.completed 
          ? 'bg-green-50 border-green-200 opacity-75' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
      }`}
    >
      <div 
        onClick={() => onToggle(habit.id)}
        className="text-2xl mr-4 cursor-pointer select-none"
        role="button"
        aria-label={`Marquer ${habit.name} comme ${habit.completed ? 'non terminé' : 'terminé'}`}
      >
        {habit.icon}
      </div>
      
      <div 
        onClick={() => onToggle(habit.id)}
        className="flex-grow cursor-pointer"
      >
        <h3 className={`font-medium transition-all ${habit.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {habit.name}
        </h3>
        <div className="flex items-center space-x-3 mt-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">{habit.time || 'A tout moment'}</span>
          {habit.dueDate && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center ${isOverdue ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
              <svg className="w-2.5 h-2.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(habit.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
          className="p-2 text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Modifier la tâche"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
          className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Supprimer la tâche"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div 
          onClick={() => onToggle(habit.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
            habit.completed ? 'bg-green-500 border-green-500 shadow-sm' : 'border-slate-300'
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
  );
};

export default HabitCard;
