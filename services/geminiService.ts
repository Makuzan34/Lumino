
import { DAILY_QUOTES } from "../constants";
import { GrowthInsight } from "../types";

const LOCAL_INSIGHTS: GrowthInsight[] = [
  {
    id: 'local-1',
    title: 'La Règle des 2 Minutes',
    content: 'Si une tâche prend moins de deux minutes, faites-la immédiatement. Cela libère votre charge mentale pour les quêtes épiques.',
    category: 'productivité',
    read: false,
    timestamp: Date.now()
  },
  {
    id: 'local-2',
    title: 'Le Pouvoir du Sommeil',
    content: 'Le sommeil n\'est pas un luxe, c\'est une phase critique de maintenance de votre aura. Visez 7 à 9 heures pour une régénération totale.',
    category: 'santé',
    read: false,
    timestamp: Date.now()
  },
  {
    id: 'local-3',
    title: 'L\'Effet Cumulé',
    content: 'De petits changements quotidiens, maintenus avec discipline, produisent des résultats colossaux à travers le temps. Soyez constant.',
    category: 'psychologie',
    read: false,
    timestamp: Date.now()
  },
  {
    id: 'local-4',
    title: 'Focus Unitaire',
    content: 'Le multitâche est un mythe qui épuise votre énergie. Consacrez-vous à une seule grande tâche à la fois pour une efficacité maximale.',
    category: 'productivité',
    read: false,
    timestamp: Date.now()
  },
  {
    id: 'local-5',
    title: 'Le Stoïcisme Moderne',
    content: 'Ne gaspillez pas votre énergie sur ce que vous ne pouvez pas contrôler. Concentrez-vous uniquement sur vos actions et vos réactions.',
    category: 'psychologie',
    read: false,
    timestamp: Date.now()
  },
  {
    id: 'local-6',
    title: 'Hydratation Maximale',
    content: 'Votre cerveau est composé à 75% d\'eau. Une légère déshydratation réduit vos capacités cognitives de 20%. Buvez dès le réveil.',
    category: 'santé',
    read: false,
    timestamp: Date.now()
  },
  {
    id: 'local-7',
    title: 'Loi de Pareto',
    content: '80% de vos résultats proviennent de 20% de vos efforts. Identifiez ces 20% et doublez votre mise sur ces activités.',
    category: 'productivité',
    read: false,
    timestamp: Date.now()
  }
];

export const getDailyWellnessTip = async (): Promise<string> => {
  // Sélection déterministe basée sur le jour de l'année
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
};

export const getGrowthInsight = async (): Promise<GrowthInsight> => {
  // Sélection déterministe basée sur le jour de l'année pour avoir un conseil différent chaque jour
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % LOCAL_INSIGHTS.length;
  return { 
    ...LOCAL_INSIGHTS[index], 
    id: `insight-${dayOfYear}`, 
    timestamp: Date.now() 
  };
};
