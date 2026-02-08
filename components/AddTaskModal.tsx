
import React, { useState, useEffect } from 'react';
import { Category, Habit } from '../types';
import { CATEGORY_LABELS } from '../constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Habit) => void;
  onUpdate: (habit: Habit) => void;
  editingHabit: Habit | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, onUpdate, editingHabit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(Category.MORNING);
  const [time, setTime] = useState('08:00');
  const [dueDate, setDueDate] = useState<string>('');
  const [icon, setIcon] = useState('✨');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setCategory(editingHabit.category);
      setTime(editingHabit.time || '08:00');
      setDueDate(editingHabit.dueDate || '');
      setIcon(editingHabit.icon);
    } else {
      setName('');
      setCategory(Category.MORNING);
      setTime('08:00');
      setDueDate('');
      setIcon('✨');
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData = {
      name,
      category,
      time,
      dueDate: dueDate || null,
      icon,
    };

    if (editingHabit) {
      onUpdate({
        ...editingHabit,
        ...habitData,
      });
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        ...habitData,
        completed: false,
      };
      onAdd(newHabit);
    }
    
    onClose();
  };

  const icons = ['✨', '🧘', '💧', '📖', '📝', '🏃', '🍎', '🍵', '💻', '🧹', '🌿', '💤', '🍳', '🚶', '💰', '🎓', '🛠️', '📞'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom sm:slide-in-from-top duration-300 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display text-slate-900">
            {editingHabit ? 'Modifier la Quête' : 'Nouvelle Quête'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nom de la quête</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Apprendre l'italien"
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Moment</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all appearance-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Heure</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Échéance (Optionnel)</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Icône</label>
            <div className="flex flex-wrap gap-3 p-1">
              {icons.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                    icon === i ? 'bg-indigo-600 shadow-lg scale-110' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform active:scale-95"
          >
            {editingHabit ? 'Mettre à jour' : 'Ajouter à mon aventure'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
