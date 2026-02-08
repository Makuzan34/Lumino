
import React, { useState } from 'react';

interface StreakCardProps {
  streak: number;
  lastLoginDate: string | null;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak, lastLoginDate }) => {
  const [showRewards, setShowRewards] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = lastLoginDate === today;

  const dailyBonus = 20 + (streak * 5);

  const milestones = [
    { days: 7, reward: 100, name: "Semaine de Fer" },
    { days: 30, reward: 500, name: "Mois de Maîtrise" },
    { days: 100, reward: 2000, name: "Centenaire de Lumière" }
  ];

  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-4 text-white shadow-lg shadow-orange-100/50 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-lg animate-pulse">
              🔥
            </div>
            <div>
              <h3 className="text-sm font-black leading-tight tracking-tight">{streak} Jours de Flamme</h3>
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-80">
                {isClaimedToday ? 'Statut : Maintenu' : 'Statut : En attente'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowRewards(!showRewards)}
            className="text-[8px] font-black uppercase tracking-widest bg-black/15 px-2 py-1 rounded-lg hover:bg-black/25 transition-colors"
          >
            {showRewards ? 'Fermer' : 'Récompenses'}
          </button>
        </div>

        {!showRewards ? (
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Bonus :</span>
              <p className="font-bold text-xs">+{dailyBonus} XP <span className="text-[9px] font-normal opacity-80">/ jour</span></p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Prochain :</span>
              <p className="font-bold text-xs">{milestones.find(m => m.days > streak)?.days || '∞'} j</p>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1">
            {milestones.map((m, i) => (
              <div key={i} className={`flex justify-between items-center p-1.5 rounded-lg ${streak >= m.days ? 'bg-white/15' : 'bg-black/10 opacity-50'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black">{m.days}j</span>
                  <span className="text-[8px] uppercase font-bold opacity-80">{m.name}</span>
                </div>
                <span className="text-[9px] font-black">+{m.reward} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakCard;
