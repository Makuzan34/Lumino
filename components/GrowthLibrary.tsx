
import React from 'react';
import { GrowthInsight } from '../types';

interface GrowthLibraryProps {
  insights: GrowthInsight[];
  onMarkLearned: (id: string) => void;
}

const GrowthLibrary: React.FC<GrowthLibraryProps> = ({ insights, onMarkLearned }) => {
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
        {insights.length === 0 ? (
          <div className="p-12 text-center text-slate-300 italic bg-white rounded-[2.5rem] border border-dashed border-slate-100">
            La bibliothèque est vide pour le moment...
          </div>
        ) : (
          insights.map((insight) => (
            <div 
              key={insight.id} 
              className={`bg-white p-6 rounded-[2.5rem] border transition-all duration-300 relative group ${
                insight.read 
                  ? 'border-slate-100 opacity-60 grayscale-[0.5]' 
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getCategoryColor(insight.category)}`}>
                  {insight.category}
                </span>
                {insight.read && (
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                    Appris <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </span>
                )}
              </div>
              
              <h4 className={`text-lg font-bold text-slate-900 mt-4 leading-tight ${insight.read ? 'line-through opacity-70' : ''}`}>
                {insight.title}
              </h4>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                {insight.content}
              </p>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[9px] text-slate-300 font-bold uppercase">
                  {new Date(insight.timestamp).toLocaleDateString('fr-FR')}
                </span>
                <button 
                  onClick={() => onMarkLearned(insight.id)}
                  className={`text-[9px] font-black uppercase transition-all flex items-center gap-1.5 ${
                    insight.read 
                      ? 'text-slate-400 hover:text-indigo-600' 
                      : 'text-indigo-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  {insight.read ? "Réinitialiser" : "Marquer comme appris"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GrowthLibrary;
