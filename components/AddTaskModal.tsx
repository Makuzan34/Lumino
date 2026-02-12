
import React, { useState, useEffect } from 'react';
import { Category, Habit, Recurrence, Difficulty, RecurrenceRule } from '../types';
import { CATEGORY_LABELS, HABIT_TEMPLATES, DIFFICULTY_LABELS } from '../constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Habit) => void;
  onUpdate: (habit: Habit) => void;
  editingHabit: Habit | null;
  initialDate?: string | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, onUpdate, editingHabit, initialDate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.MORNING);
  const [time, setTime] = useState('08:00');
  const [dueDate, setDueDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [recurrence, setRecurrence] = useState<Recurrence>(Recurrence.NONE);
  const [interval, setInterval] = useState<number>(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
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
      setStartDate(editingHabit.startDate || new Date().toISOString().split('T')[0]);
      setRecurrence(editingHabit.recurrence || Recurrence.NONE);
      setInterval(editingHabit.recurrenceRule?.interval || 1);
      setDaysOfWeek(editingHabit.recurrenceRule?.daysOfWeek || []);
      setDifficulty(editingHabit.difficulty || Difficulty.MEDIUM);
      setIcon(editingHabit.icon);
    } else {
      setName('');
      setDescription('');
      setCategory(Category.MORNING);
      setTime('08:00');
      setDueDate(initialDate || '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setRecurrence(initialDate ? Recurrence.NONE : Recurrence.DAILY);
      setInterval(1);
      setDaysOfWeek([]);
      setDifficulty(Difficulty.MEDIUM);
      setIcon('✨');
    }
  }, [editingHabit, isOpen, initialDate]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const recurrenceRule: RecurrenceRule = {
      interval: interval || 1,
      daysOfWeek: recurrence === Recurrence.WEEKLY ? (daysOfWeek.length > 0 ? daysOfWeek : undefined) : undefined
    };

    const habitData = {
      name,
      description: description.trim() || undefined,
      category,
      time,
      dueDate: dueDate || null,
      startDate: startDate || new Date().toISOString().split('T')[0],
      recurrence,
      recurrenceRule,
      difficulty,
      icon,
    };

    if (editingHabit) {
      onUpdate({ ...editingHabit, ...habitData });
    } else {
      const newHabit: Habit = { 
        id: crypto.randomUUID(), 
        ...habitData, 
        completed: false,
        completionHistory: [],
        currentStreak: 0,
        bestStreak: 0
      };
      onAdd(newHabit);
    }
    onClose();
  };

  const icons = ['✨', '🧘', '💧', '📖', '🏃', '🍎', '💻', '🎓', '🛠️', '✈️', '🌍', '🏠'];
  const weekDays = [
    { label: 'L', value: 1 },
    { label: 'M', value: 2 },
    { label: 'M', value: 3 },
    { label: 'J', value: 4 },
    { label: 'V', value: 5 },
    { label: 'S', value: 6 },
    { label: 'D', value: 0 },
  ];

  const difficultyOptions = [
    { value: Difficulty.EASY, color: 'hover:bg-emerald-50 peer-checked:bg-emerald-600 peer-checked:text-white border-emerald-200' },
    { value: Difficulty.MEDIUM, color: 'hover:bg-indigo-50 peer-checked:bg-indigo-600 peer-checked:text-white border-indigo-200' },
    { value: Difficulty.HARD, color: 'hover:bg-amber-50 peer-checked:bg-amber-600 peer-checked:text-white border-amber-200' },
    { value: Difficulty.HEROIC, color: 'hover:bg-rose-50 peer-checked:bg-rose-600 peer-checked:text-white border-rose-200' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl p-8 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh] no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display text-slate-900">{editingHabit ? 'Modifier la Tâche' : 'Nouvelle Tâche'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        {!showTemplates ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de la tâche</label>
                 <button type="button" onClick={() => setShowTemplates(true)} className="text-[10px] text-indigo-600 font-bold uppercase hover:underline">Modèles</button>
              </div>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Apprendre l'Italien"
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all shadow-inner text-slate-900 font-medium"
              />
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Heure</label>
                <input 
                  type="time" value={time} onChange={(e) => setTime(e.target.value)} 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none transition-all text-slate-900 text-sm" 
                />
              </div>
            </div>

            <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
              <div>
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Type de Récurrence</label>
                <div className="grid grid-cols-2 gap-2">
                   {(Object.values(Recurrence)).map(rec => (
                     <button 
                       key={rec}
                       type="button"
                       onClick={() => setRecurrence(rec)}
                       className={`py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                         recurrence === rec 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-white text-indigo-400 border-indigo-100 hover:bg-indigo-50'
                       }`}
                     >
                       {rec === Recurrence.NONE ? 'Unique' : rec === Recurrence.DAILY ? 'Quotidien' : rec === Recurrence.WEEKLY ? 'Hebdo' : 'Mensuel'}
                     </button>
                   ))}
                </div>
              </div>

              {recurrence !== Recurrence.NONE && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Intervalle</label>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => setInterval(Math.max(1, interval - 1))}
                        className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold"
                      >-</button>
                      <span className="text-sm font-bold text-indigo-900">Tous les {interval} {recurrence === Recurrence.DAILY ? 'jours' : recurrence === Recurrence.WEEKLY ? 'semaines' : 'mois'}</span>
                      <button 
                        type="button" 
                        onClick={() => setInterval(interval + 1)}
                        className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold"
                      >+</button>
                    </div>
                  </div>

                  {recurrence === Recurrence.WEEKLY && (
                    <div>
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Jours Spécifiques</label>
                      <div className="flex justify-between">
                        {weekDays.map(day => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black transition-all border ${
                              daysOfWeek.includes(day.value)
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-300 border-indigo-50'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Difficulté & XP</label>
              <div className="flex gap-2">
                {difficultyOptions.map((opt) => (
                  <label key={opt.value} className="flex-1 cursor-pointer">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date de début</label>
                <input 
                  type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date de fin</label>
                <input 
                  type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  placeholder="Optionnel"
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Icône</label>
              <div className="flex flex-wrap gap-2">
                {icons.map(i => (
                  <button 
                    key={i} 
                    type="button" 
                    onClick={() => setIcon(i)} 
                    className={`text-xl w-10 h-10 flex items-center justify-center rounded-xl transition-all ${icon === i ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {i}
                  </button>
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
               <h3 className="text-lg font-bold text-slate-900 font-display">Bibliothèque de Tâches</h3>
               <button onClick={() => setShowTemplates(false)} className="text-indigo-600 text-xs font-bold uppercase hover:underline">Retour</button>
            </div>
            <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
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
