
import React, { useState, useEffect } from 'react';
import { Category, Habit } from '../types';
import { CATEGORY_LABELS, HABIT_TEMPLATES } from '../constants';

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
  const [showTemplates, setShowTemplates] = useState(false);

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
      onUpdate({ ...editingHabit, ...habitData });
    } else {
      const newHabit: Habit = { id: crypto.randomUUID(), ...habitData, completed: false };
      onAdd(newHabit);
    }
    onClose();
  };

  const icons = ['✨', '🧘', '💧', '📖', '🏃', '🍎', '💻', '🎓', '🛠️', '✈️', '🌍', '🏠'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl p-8 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display text-slate-900">{editingHabit ? 'Modifier la Tâche' : 'Nouvelle Tâche'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400">✕</button>
        </div>

        {!showTemplates ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-end mb-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de la tâche</label>
               <button type="button" onClick={() => setShowTemplates(true)} className="text-[10px] text-indigo-600 font-bold uppercase hover:underline">Choisir un modèle</button>
            </div>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Apprendre l'Italien"
              className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-200 focus:border-indigo-500 outline-none transition-all shadow-inner"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Moment</label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none transition-all appearance-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Heure</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Icône</label>
              <div className="flex flex-wrap gap-2">
                {icons.map(i => (
                  <button key={i} type="button" onClick={() => setIcon(i)} className={`text-xl w-10 h-10 flex items-center justify-center rounded-xl transition-all ${icon === i ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 hover:bg-slate-100'}`}>{i}</button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
              {editingHabit ? 'Mettre à jour' : 'Ajouter à mon Aventure'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold">Bibliothèque de Tâches</h3>
               <button onClick={() => setShowTemplates(false)} className="text-indigo-600 text-xs font-bold uppercase">Retour</button>
            </div>
            <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {HABIT_TEMPLATES.map((tpl, i) => (
                <button
                  key={i} type="button"
                  onClick={() => {
                    setName(tpl.name);
                    setIcon(tpl.icon);
                    setCategory(tpl.category);
                    setShowTemplates(false);
                  }}
                  className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-white transition-all text-left"
                >
                  <span className="text-2xl mr-3">{tpl.icon}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{tpl.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{CATEGORY_LABELS[tpl.category]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTaskModal;
