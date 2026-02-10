
import React from 'react';
import { GrowthInsight } from '../types';

interface GrowthLibraryProps {
  insights: GrowthInsight[];
}

const GrowthLibrary: React.FC<GrowthLibraryProps> = ({ insights }) => {
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'psychologie': return 'bg-indigo-50 text-indigo-600';
      case 'santé': return 'bg-emerald-50 text-emerald-600';
      case 'finance': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-1 flex justify-between items-end">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bibliothèque de Croissance</h3>
        <span className="text-[9px] text-indigo-500 font-bold">Sagesse Lumino</span>
      </div>
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getCategoryColor(insight.category)}`}>
              {insight.category}
            </span>
            <h4 className="text-lg font-bold text-slate-900 mt-4 leading-tight">{insight.title}</h4>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              {insight.content}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[9px] text-slate-300 font-bold uppercase">{new Date(insight.timestamp).toLocaleDateString('fr-FR')}</span>
              <button className="text-[9px] font-black text-indigo-600 uppercase">Marquer comme appris</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrowthLibrary;
