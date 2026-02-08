
import React, { useState, useEffect } from 'react';
import { Challenge } from '../types';
import { QUEST_LIBRARY } from '../constants';

interface AddChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (challenge: Challenge) => void;
  onUpdate: (challenge: Challenge) => void;
  editingChallenge: Challenge | null;
}

const AddChallengeModal: React.FC<AddChallengeModalProps> = ({ isOpen, onClose, onAdd, onUpdate, editingChallenge }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(21);
  const [icon, setIcon] = useState('🏆');
  const [color, setColor] = useState('bg-indigo-600');
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    if (editingChallenge) {
      setTitle(editingChallenge.title);
      setDescription(editingChallenge.description);
      setDuration(editingChallenge.duration);
      setIcon(editingChallenge.icon);
      setColor(editingChallenge.color);
    } else {
      setTitle('');
      setDescription('');
      setDuration(21);
      setIcon('🏆');
      setColor('bg-indigo-600');
    }
  }, [editingChallenge, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const challengeData = {
      title,
      description,
      duration,
      icon,
      color,
    };

    if (editingChallenge) {
      onUpdate({ ...editingChallenge, ...challengeData });
    } else {
      const newChallenge: Challenge = { 
        id: crypto.randomUUID(), 
        ...challengeData, 
        currentDay: 0 
      };
      onAdd(newChallenge);
    }
    onClose();
  };

  const icons = ['🏆', '🏃', '📖', '💻', '🧘', '💧', '🍱', '🧹', '💰', '🥋', '🔨', '🎨'];
  const colors = [
    { name: 'Indigo', class: 'bg-indigo-600' },
    { name: 'Emerald', class: 'bg-emerald-600' },
    { name: 'Rose', class: 'bg-rose-500' },
    { name: 'Amber', class: 'bg-amber-600' },
    { name: 'Slate', class: 'bg-slate-700' },
    { name: 'Red', class: 'bg-red-600' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Teal', class: 'bg-teal-500' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl p-8 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display text-slate-900">{editingChallenge ? 'Modifier la Quête' : 'Nouvelle Quête'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400">✕</button>
        </div>

        {!showLibrary ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-between items-end mb-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titre de la quête</label>
               {!editingChallenge && (
                 <button type="button" onClick={() => setShowLibrary(true)} className="text-[10px] text-indigo-600 font-bold uppercase hover:underline">Ouvrir le grimoire</button>
               )}
            </div>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 21 Jours de Calme"
              className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-200 focus:border-indigo-500 outline-none transition-all shadow-inner"
            />

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Quel est le but de cette épreuve ?"
                className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-200 focus:border-indigo-500 outline-none transition-all shadow-inner h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Durée (jours)</label>
                <input 
                  type="number" min="1" max="100" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Icône</label>
                <select 
                  value={icon} onChange={(e) => setIcon(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none appearance-none"
                >
                  {icons.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Couleur d'aura</label>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button 
                    key={c.class} type="button" onClick={() => setColor(c.class)} 
                    className={`w-8 h-8 rounded-full ${c.class} transition-all ${color === c.class ? 'ring-4 ring-slate-200 scale-110 shadow-lg' : 'hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
              {editingChallenge ? 'Confirmer les changements' : 'Accepter la mission'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold">Le Grimoire des Quêtes</h3>
               <button onClick={() => setShowLibrary(false)} className="text-indigo-600 text-xs font-bold uppercase">Retour</button>
            </div>
            <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {QUEST_LIBRARY.slice(0, 50).map((tpl, i) => (
                <button
                  key={i} type="button"
                  onClick={() => {
                    setTitle(tpl.title);
                    setDescription(tpl.description);
                    setIcon(tpl.icon);
                    setColor(tpl.color);
                    setDuration(tpl.duration);
                    setShowLibrary(false);
                  }}
                  className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-white transition-all text-left"
                >
                  <div className={`w-10 h-10 ${tpl.color} rounded-xl flex items-center justify-center text-white text-xl mr-3 shadow-sm`}>{tpl.icon}</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{tpl.title}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">{tpl.duration} jours</p>
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

export default AddChallengeModal;
