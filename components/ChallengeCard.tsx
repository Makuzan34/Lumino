
import React from 'react';
import { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onCheckIn: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onCheckIn, onDelete }) => {
  const progress = Math.min((challenge.currentDay / challenge.duration) * 100, 100);
  const isCompletedToday = challenge.lastCompletedDate === new Date().toISOString().split('T')[0];
  const isFinished = challenge.currentDay >= challenge.duration;

  return (
    <div className={`relative p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl ${challenge.color} text-white flex items-center justify-center text-2xl shadow-lg`}>
          {challenge.icon}
        </div>
        <button 
          onClick={() => onDelete(challenge.id)}
          className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-1">{challenge.title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{challenge.description}</p>

      <div className="space-y-3">
        <div className="flex justify-between items-end text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Progression</span>
          <span className="text-slate-800">{challenge.currentDay} / {challenge.duration} jours</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${challenge.color}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        disabled={isCompletedToday || isFinished}
        onClick={() => onCheckIn(challenge.id)}
        className={`w-full mt-6 py-4 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${
          isFinished 
            ? 'bg-emerald-50 text-emerald-600 cursor-default'
            : isCompletedToday
            ? 'bg-slate-50 text-slate-400 cursor-default'
            : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
        }`}
      >
        {isFinished ? (
          <>
            <span>Défi Terminé !</span>
            <span>🏆</span>
          </>
        ) : isCompletedToday ? (
          <>
            <span>Validé aujourd'hui</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
