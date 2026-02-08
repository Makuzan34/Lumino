
import React from 'react';
import { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onCheckIn: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (challenge: Challenge) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onCheckIn, onDelete, onEdit }) => {
  const progress = Math.min((challenge.currentDay / challenge.duration) * 100, 100);
  const isCompletedToday = challenge.lastCompletedDate === new Date().toISOString().split('T')[0];
  const isFinished = challenge.currentDay >= challenge.duration;

  return (
    <div className="relative p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-3xl ${challenge.color} text-white flex items-center justify-center text-3xl shadow-xl shadow-slate-100`}>
          {challenge.icon}
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(challenge)}
            className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(challenge.id)}
            className="p-3 text-slate-300 hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{challenge.title}</h3>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed opacity-80">{challenge.description}</p>

      <div className="space-y-4">
        <div className="flex justify-between items-end text-[11px] font-black text-slate-400 uppercase tracking-widest">
          <span>Progression</span>
          <span className="text-slate-900">{challenge.currentDay} / {challenge.duration}</span>
        </div>
        <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${challenge.color}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        disabled={isCompletedToday || isFinished}
        onClick={() => onCheckIn(challenge.id)}
        className={`w-full mt-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 flex items-center justify-center space-x-2 ${
          isFinished 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : isCompletedToday
            ? 'bg-slate-50 text-slate-300 border border-transparent'
            : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-black'
        }`}
      >
        {isFinished ? (
          <>
            <span>Complétée</span>
            <span>✨</span>
          </>
        ) : isCompletedToday ? (
          <>
            <span>Aujourd'hui Validé</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </>
        ) : (
          <span>Valider Jour {challenge.currentDay + 1}</span>
        )}
      </button>
    </div>
  );
};

export default ChallengeCard;
