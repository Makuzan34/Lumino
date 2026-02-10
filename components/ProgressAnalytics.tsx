
import React from 'react';
import { UserStats, Habit } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ProgressAnalyticsProps {
  stats: UserStats;
  habits: Habit[];
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ stats, habits }) => {
  // Simuler des données si moodLogs est vide pour l'exemple
  const data = stats.moodLogs.length > 0 
    ? stats.moodLogs.map(l => ({ name: l.date.split('-')[2], mood: l.mood, energy: l.energy }))
    : [
        { name: 'Lun', mood: 3, energy: 4 },
        { name: 'Mar', mood: 4, energy: 3 },
        { name: 'Mer', mood: 5, energy: 5 },
        { name: 'Jeu', mood: 2, energy: 3 },
        { name: 'Ven', mood: 4, energy: 4 },
      ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Focus Total</p>
          <h4 className="text-2xl font-bold mt-1">{stats.totalFocusMinutes}m</h4>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Rituels Finis</p>
          <h4 className="text-2xl font-bold mt-1">{stats.totalHabitsCompleted}</h4>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">Tendance d'Aura</h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="mood" stroke="#4f46e5" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[9px] text-slate-300 font-bold uppercase mt-4 tracking-widest">Évolution de votre humeur sur 7 jours</p>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
