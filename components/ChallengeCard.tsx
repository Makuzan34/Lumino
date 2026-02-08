
import React, { useState } from 'react';
import { Challenge, Difficulty } from '../types';
import { CHALLENGE_XP_VALUES, DIFFICULTY_LABELS } from '../constants';

interface ChallengeCardProps {
  challenge: Challenge;
  onCheckIn: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (challenge: Challenge) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onCheckIn, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = Math.min((challenge.currentDay / challenge.duration) * 100, 100);
  const isCompletedToday = challenge.lastCompletedDate === new Date().toISOString().split('T')[0];
  const isFinished = challenge.currentDay >= challenge.duration;
  const xpValue = CHALLENGE_XP_VALUES[challenge.difficulty || Difficulty.MEDIUM];

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.EASY: return 'text-emerald-500 bg-emerald-50';
      case Difficulty.MEDIUM: return 'text-indigo-500 bg-indigo-50';
      case Difficulty.HARD: return 'text-amber-500 bg-amber-50';
      case Difficulty.HEROIC: return 'text-rose-500 bg-rose-50';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  return (
    <div className="relative p-6 sm:p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-3xl ${challenge.color} text-white flex items-center justify-center text-3xl shadow-xl shadow-slate-100`}>
            {challenge.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{challenge.title}</h3>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0">
                +{xpValue} XP
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quête de {challenge.duration} jours</p>
              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${getDifficultyColor(challenge.difficulty)}`}>
                {DIFFICULTY_LABELS[challenge.difficulty]}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 text-slate-300 hover:text-indigo-600 transition-all ${isExpanded ? 'rotate-180' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="hidden group-hover:flex items-center space-x-1 animate-in fade-in duration-200">
            <button 
              onClick={() => onEdit(challenge)}
              className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={() => onDelete(challenge.id)}
              className="p-2 text-slate-300 hover:text-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <p className="text-sm text-slate-500 mb-8 leading-relaxed opacity-80 animate-in fade-in slide-in-from-top-2 duration-300">
          {challenge.description}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-end text-[11px] font-black text-slate-400 uppercase tracking-widest">
          <span>Progression de la Quête</span>
          <span className="text-slate-900">{challenge.currentDay} / {challenge.duration} Jours</span>
        </div>
        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden shadow-inner">
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
            <span>Quête Accomplie</span>
            <span>✨</span>
          </>
        ) : isCompletedToday ? (
          <>
            <span>Rituel Validé</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </>
        ) : (
          <span>Valider Jour {challenge.currentDay + 1} (+{xpValue} XP)</span>
        )}
      </button>
    </div>
  );
};

export default ChallengeCard;
