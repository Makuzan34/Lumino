
import React from 'react';
import { MoodLog } from '../types';

interface MoodTrackerProps {
  onLog: (mood: number, energy: number) => void;
  lastLog?: MoodLog;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onLog, lastLog }) => {
  const moods = [
    { v: 1, i: '😔' },
    { v: 2, i: '😐' },
    { v: 3, i: '🙂' },
    { v: 4, i: '😊' },
    { v: 5, i: '🤩' },
  ];

  if (lastLog) {
    return (
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">État d'Aura</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Humeur consignée aujourd'hui</p>
        </div>
        <div className="text-3xl">{moods.find(m => m.v === lastLog.mood)?.i}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm animate-in slide-in-from-top duration-500">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 text-center mb-6">Comment vibrez-vous aujourd'hui ?</h3>
      <div className="flex justify-between items-center mb-8">
        {moods.map((m) => (
          <button
            key={m.v}
            onClick={() => onLog(m.v, 3)}
            className="text-4xl hover:scale-125 transition-transform active:scale-95 grayscale hover:grayscale-0"
          >
            {m.i}
          </button>
        ))}
      </div>
      <p className="text-[9px] text-center text-slate-400 uppercase font-black tracking-widest">Gagnez +10 XP en notant votre aura</p>
    </div>
  );
};

export default MoodTracker;
