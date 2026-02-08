
import React, { useState, useEffect } from 'react';
import { Category, Habit, Recurrence, Difficulty } from '../types';
import { CATEGORY_LABELS, HABIT_TEMPLATES, DIFFICULTY_LABELS } from '../constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Habit) => void;
  onUpdate: (habit: Habit) => void;
  editingHabit: Habit | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, onUpdate, editingHabit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.MORNING);
  const [time, setTime] = useState('08:00');
  const [dueDate, setDueDate] = useState<string>('');
  const [recurrence, setRecurrence] = useState<Recurrence>(Recurrence.NONE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [icon, setIcon] = useState('✨');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category);
      setTime(editingHabit.time || '08:00');
      setDueDate(editingHabit.dueDate || '');
      setRecurrence(editingHabit.recurrence || Recurrence.NONE);
      setDifficulty(editingHabit.difficulty || Difficulty.MEDIUM);
      setIcon(editingHabit.icon);
    } else {
      setName('');
      setDescription('');
      setCategory(Category.MORNING);
      setTime('08:00');
      setDueDate('');
      setRecurrence(Recurrence.NONE);
      setDifficulty(Difficulty.MEDIUM);
      setIcon('✨');
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData = {
      name,
      description: description.trim() || undefined,
      category,
      time,
      dueDate: dueDate || null,
      recurrence,
      difficulty,
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
  
  const difficultyOptions = [
    { value: Difficulty.EASY, color: 'hover:bg-emerald-50 peer-checked:bg-emerald-600 peer-checked:text-white border-emerald-200' },
    { value: Difficulty.MEDIUM, color: 'hover:bg-indigo-50 peer-checked:bg-indigo-600 peer-checked:text-white border-indigo-200' },
    { value: Difficulty.HARD, color: 'hover:bg-amber-50 peer-checked:bg-amber-600 peer-checked:text-white border-amber-200' },
    { value: Difficulty.HEROIC, color: 'hover:bg-rose-50 peer-checked:bg-rose-600 peer-checked:text-white border-rose-200' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl p-8 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display text-slate-900">{editingHabit ? 'Modifier la Tâche' : 'Nouvelle Tâche'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        {!showTemplates ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex justify-between items-end mb-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de la tâche</label>
                 <button type="button" onClick={() => setShowTemplates(true)} className="text-[10px] text-indigo-600 font-bold uppercase hover:underline">Modèles de Tâches</button>
              </div>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Apprendre l'Italien"
                className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-200 focus:border-indigo-500 outline-none transition-all shadow-inner text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Difficulté & XP</label>
              <div className="flex gap-2">
                {difficultyOptions.map((opt) => (
                  <label key={opt.value} className="flex-1 cursor-pointer group">
                    <input 
                      type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} 
                      onChange={() => setDifficulty(opt.value)} className="hidden peer" 
                    />
                    <div className={`text-center py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all ${opt.color}`}>
                      {DIFFICULTY_LABELS[opt.value]}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description (optionnelle)</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails sur cette quête quotidienne..."
                className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-200 focus:border-indigo-500 outline-none transition-all shadow-inner h-20 resize-none text-slate-900 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Échéance</label>
                <input 
                  type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none transition-all text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Heure</label>
                <input 
                  type="time" value={time} onChange={(e) => setTime(e.target.value)} 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none transition-all text-slate-900 text-sm" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Moment</label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none transition-all appearance-none text-slate-900 text-sm"
                >
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Récurrence</label>
                <select 
                  value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none transition-all appearance-none text-slate-900 text-sm"
                >
                  <option value={Recurrence.NONE}>Unique</option>
                  <option value={Recurrence.DAILY}>Quotidien</option>
                  <option value={Recurrence.WEEKLY}>Hebdomadaire</option>
                  <option value={Recurrence.MONTHLY}>Mensuel</option>
                </select>
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

            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs mt-2">
              {editingHabit ? 'Confirmer les modifications' : 'Ajouter au Grimoire'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-900">Bibliothèque de Tâches</h3>
               <button onClick={() => setShowTemplates(false)} className="text-indigo-600 text-xs font-bold uppercase hover:underline">Retour</button>
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
                  className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-white transition-all text-left group"
                >
                  <span className="text-2xl mr-3 grayscale group-hover:grayscale-0 transition-all">{tpl.icon}</span>
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
