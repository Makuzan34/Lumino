
import { Category, Habit, Challenge, HeroicTitle } from './types';

export const XP_PER_HABIT = 15;
export const XP_PER_CHALLENGE_DAY = 50;
export const XP_CHALLENGE_COMPLETE = 200;
export const MAX_LEVEL = 100;

export const GET_RANK = (level: number): string => {
  if (level >= 100) return 'Divinité de Lumino 🌌';
  if (level >= 80) return 'Archi-Maître de l\'Existence';
  if (level >= 60) return 'Gardien de l\'Équilibre';
  if (level >= 40) return 'Adepte de la Clarté';
  if (level >= 20) return 'Voyageur de l\'Esprit';
  return 'Novice de Lumino';
};

export const HEROIC_TITLES: HeroicTitle[] = [
  // --- NIVEAUX ---
  { id: 't1', name: 'Le Nouveau-Né', description: 'Atteindre le niveau 1.', rarity: 'common', condition: (s) => s.level >= 1 },
  { id: 't2', name: 'L\'Éveillé', description: 'Atteindre le niveau 5.', rarity: 'common', condition: (s) => s.level >= 5 },
  { id: 't3', name: 'Le Résolu', description: 'Atteindre le niveau 10.', rarity: 'common', condition: (s) => s.level >= 10 },
  { id: 't4', name: 'Le Chercheur', description: 'Atteindre le niveau 15.', rarity: 'rare', condition: (s) => s.level >= 15 },
  { id: 't5', name: 'Le Voyageur Astral', description: 'Atteindre le niveau 20.', rarity: 'rare', condition: (s) => s.level >= 20 },
  { id: 't6', name: 'L\'Esprit Libre', description: 'Atteindre le niveau 25.', rarity: 'rare', condition: (s) => s.level >= 25 },
  { id: 't7', name: 'Le Maître des Sens', description: 'Atteindre le niveau 30.', rarity: 'rare', condition: (s) => s.level >= 30 },
  { id: 't8', name: 'Le Protecteur', description: 'Atteindre le niveau 35.', rarity: 'epic', condition: (s) => s.level >= 35 },
  { id: 't9', name: 'L\'Oracle du Matin', description: 'Atteindre le niveau 40.', rarity: 'epic', condition: (s) => s.level >= 40 },
  { id: 't10', name: 'Le Sage de l\'Ordre', description: 'Atteindre le niveau 45.', rarity: 'epic', condition: (s) => s.level >= 45 },
  { id: 't11', name: 'L\'Avatar Solaire', description: 'Atteindre le niveau 50.', rarity: 'epic', condition: (s) => s.level >= 50 },
  { id: 't12', name: 'Le Phénix d\'Or', description: 'Atteindre le niveau 55.', rarity: 'epic', condition: (s) => s.level >= 55 },
  { id: 't13', name: 'Le Veilleur d\'Émeraude', description: 'Atteindre le niveau 60.', rarity: 'legendary', condition: (s) => s.level >= 60 },
  { id: 't14', name: 'Le Roi des Habitudes', description: 'Atteindre le niveau 65.', rarity: 'legendary', condition: (s) => s.level >= 65 },
  { id: 't15', name: 'L\'Empereur du Focus', description: 'Atteindre le niveau 70.', rarity: 'legendary', condition: (s) => s.level >= 70 },
  { id: 't16', name: 'Le Demi-Dieu', description: 'Atteindre le niveau 75.', rarity: 'legendary', condition: (s) => s.level >= 75 },
  { id: 't17', name: 'Le Maître de l\'Aura', description: 'Atteindre le niveau 80.', rarity: 'legendary', condition: (s) => s.level >= 80 },
  { id: 't18', name: 'Le Souverain Absolu', description: 'Atteindre le niveau 85.', rarity: 'legendary', condition: (s) => s.level >= 85 },
  { id: 't19', name: 'L\'Entité de Lumière', description: 'Atteindre le niveau 90.', rarity: 'legendary', condition: (s) => s.level >= 90 },
  { id: 't20', name: 'L\'Éternel de Lumino', description: 'Atteindre le niveau 100.', rarity: 'legendary', condition: (s) => s.level >= 100 },

  // --- HABITUDES ---
  { id: 't21', name: 'Apprenti Artisan', description: '5 habitudes complétées.', rarity: 'common', condition: (s) => s.totalHabitsCompleted >= 5 },
  { id: 't22', name: 'Compagnon Fidèle', description: '10 habitudes complétées.', rarity: 'common', condition: (s) => s.totalHabitsCompleted >= 10 },
  { id: 't23', name: 'Ouvrier du Destin', description: '20 habitudes complétées.', rarity: 'common', condition: (s) => s.totalHabitsCompleted >= 20 },
  { id: 't24', name: 'Forgeron de Routine', description: '30 habitudes complétées.', rarity: 'rare', condition: (s) => s.totalHabitsCompleted >= 30 },
  { id: 't25', name: 'Sculpteur de Vie', description: '40 habitudes complétées.', rarity: 'rare', condition: (s) => s.totalHabitsCompleted >= 40 },
  { id: 't26', name: 'Tisseur de Temps', description: '50 habitudes complétées.', rarity: 'rare', condition: (s) => s.totalHabitsCompleted >= 50 },
  { id: 't29', name: 'Le Méthodique', description: '80 habitudes complétées.', rarity: 'epic', condition: (s) => s.totalHabitsCompleted >= 80 },
  { id: 't30', name: 'Architecte d\'Habitudes', description: '100 habitudes complétées.', rarity: 'epic', condition: (s) => s.totalHabitsCompleted >= 100 },
  { id: 't35', name: 'Maître d\'Oeuvre', description: '300 habitudes complétées.', rarity: 'legendary', condition: (s) => s.totalHabitsCompleted >= 300 },
  { id: 't40', name: 'Le Démiurge', description: '2000 habitudes complétées.', rarity: 'legendary', condition: (s) => s.totalHabitsCompleted >= 2000 },
  
  // --- SERIES ---
  { id: 't41', name: 'Série de Bronze', description: '3 jours de suite.', rarity: 'common', condition: (s) => s.streak >= 3 },
  { id: 't46', name: 'Âme de Feu', description: '7 jours de suite.', rarity: 'rare', condition: (s) => s.streak >= 7 },
  { id: 't51', name: 'Maître du Mois', description: '30 jours de suite.', rarity: 'epic', condition: (s) => s.streak >= 30 },
  { id: 't60', name: 'Année de Lumière', description: '365 jours de suite.', rarity: 'legendary', condition: (s) => s.streak >= 365 },
];

export const QUEST_LIBRARY: Omit<Challenge, 'id' | 'currentDay' | 'lastCompletedDate'>[] = [
  // --- SPORT & SANTÉ ---
  { title: "Yoga de l'Aube", description: "15 min de salutation au soleil.", duration: 7, icon: "🧘", color: "bg-teal-500" },
  { title: "Escalier Héroïque", description: "Oubliez l'ascenseur toute la journée.", duration: 5, icon: "🪜", color: "bg-orange-500" },
  { title: "Planche d'Acier", description: "Maintenir 1 min de gainage.", duration: 10, icon: "💪", color: "bg-slate-600" },
  { title: "Hydratation Vitale", description: "2L d'eau par jour sans faute.", duration: 30, icon: "💧", color: "bg-blue-400" },
  { title: "Marche Astrale", description: "10 000 pas quotidiens.", duration: 14, icon: "🚶", color: "bg-lime-500" },
  { title: "Course du Vent", description: "20 min de jogging léger.", duration: 7, icon: "🏃", color: "bg-red-400" },
  { title: "Étirements Zen", description: "Séance de stretching avant dodo.", duration: 5, icon: "🤸", color: "bg-purple-400" },
  { title: "Douche Glacée", description: "30s d'eau froide à la fin.", duration: 7, icon: "❄️", color: "bg-cyan-400" },
  { title: "Cœur de Lion", description: "15 min de cardio intensif.", duration: 10, icon: "❤️", color: "bg-rose-500" },
  { title: "Mobilité Matinale", description: "Réveil articulaire complet.", duration: 7, icon: "🦴", color: "bg-amber-400" },

  // --- LECTURE & CULTURE ---
  { title: "Bibliophile Matinal", description: "Lire 10 pages au petit déjeuner.", duration: 14, icon: "📖", color: "bg-indigo-600" },
  { title: "Poésie du Soir", description: "Lire un poème avant de dormir.", duration: 5, icon: "📜", color: "bg-pink-400" },
  { title: "Savoir Antique", description: "Lire un chapitre d'un livre d'histoire.", duration: 10, icon: "🏛️", color: "bg-amber-700" },
  { title: "Critique Littéraire", description: "Noter un résumé de sa lecture.", duration: 7, icon: "✍️", color: "bg-slate-400" },
  { title: "Odyssée de Fiction", description: "Lire 30 min d'un roman imaginaire.", duration: 21, icon: "🧚", color: "bg-violet-600" },
  { title: "Curiosité Scientifique", description: "Lire un article de science.", duration: 5, icon: "🔬", color: "bg-blue-600" },
  { title: "Art & Lumière", description: "Visiter une galerie ou musée en ligne.", duration: 3, icon: "🎨", color: "bg-yellow-600" },
  { title: "Sagesse Philosophique", description: "Lire une citation et méditer dessus.", duration: 7, icon: "🦉", color: "bg-emerald-700" },

  // --- VOYAGE & EXPLORATION ---
  { title: "Explorateur Local", description: "Visiter un nouveau quartier à pied.", duration: 1, icon: "🗺️", color: "bg-green-600" },
  { title: "Sentier Inconnu", description: "Faire une randonnée en forêt.", duration: 1, icon: "🌲", color: "bg-emerald-600" },
  { title: "Parc de Sérénité", description: "Passer 30 min dans un parc sans tel.", duration: 5, icon: "🍃", color: "bg-teal-400" },
  { title: "Horizon Lointain", description: "Planifier son futur voyage idéal.", duration: 3, icon: "✈️", color: "bg-sky-500" },
  { title: "Pique-Nique Royal", description: "Manger dehors au soleil.", duration: 3, icon: "🧺", color: "bg-orange-300" },
  { title: "Photographe d'Instant", description: "Prendre 5 photos de la ville.", duration: 5, icon: "📷", color: "bg-slate-800" },
  { title: "Marché Couleurs", description: "Acheter des produits au marché.", duration: 3, icon: "🍎", color: "bg-red-500" },

  // --- APPRENTISSAGE ---
  { title: "Polyglotte Junior", description: "Apprendre 5 mots d'une langue.", duration: 30, icon: "🌍", color: "bg-indigo-400" },
  { title: "Code de Lumière", description: "Écrire une fonction simple.", duration: 14, icon: "💻", color: "bg-slate-700" },
  { title: "Chef Étoilé", description: "Cuisiner une nouvelle recette saine.", duration: 5, icon: "🍳", color: "bg-orange-400" },
  { title: "Mélodie Douce", description: "Pratiquer un instrument 15 min.", duration: 10, icon: "🎸", color: "bg-rose-400" },
  { title: "Origami Zen", description: "Plier une forme en papier par jour.", duration: 7, icon: "🦢", color: "bg-pink-300" },
  { title: "Échecs du Roi", description: "Jouer ou étudier une partie.", duration: 10, icon: "♟️", color: "bg-slate-900" },
  { title: "Podcast du Savoir", description: "Écouter 20 min de contenu éducatif.", duration: 7, icon: "🎧", color: "bg-purple-500" },

  // --- TRAVAIL & PRODUCTIVITÉ ---
  { title: "Inbox Zéro", description: "Vider sa boîte mail avant 18h.", duration: 5, icon: "📩", color: "bg-blue-400" },
  { title: "Focus Profond", description: "2h de travail sans distraction.", duration: 10, icon: "🎯", color: "bg-indigo-500" },
  { title: "Bureau de Crystal", description: "Ranger son espace de travail.", duration: 3, icon: "🧹", color: "bg-slate-200" },
  { title: "Planificateur Expert", description: "Lister ses 3 priorités du lendemain.", duration: 14, icon: "📝", color: "bg-emerald-500" },
  { title: "Zéro Procrastination", description: "Faire la tâche la plus dure en 1er.", duration: 7, icon: "🚀", color: "bg-orange-600" },
  { title: "Pauses Actives", description: "S'étirer toutes les heures de travail.", duration: 5, icon: "🔄", color: "bg-blue-300" },

  // --- FAMILLE & SOCIAL ---
  { title: "Cœur Ouvert", description: "Appeler un proche pour prendre des news.", duration: 7, icon: "📞", color: "bg-green-400" },
  { title: "Dîner de Lumière", description: "Manger en famille sans écrans.", duration: 10, icon: "🍽️", color: "bg-amber-500" },
  { title: "Compliment Gratuit", description: "Faire un vrai compliment à quelqu'un.", duration: 5, icon: "🗣️", color: "bg-yellow-400" },
  { title: "Écoute Active", description: "Écouter 10 min sans interrompre.", duration: 3, icon: "👂", color: "bg-blue-200" },
  { title: "Gratitude Partagée", description: "Dire merci sincèrement à 3 personnes.", duration: 7, icon: "🙏", color: "bg-rose-300" },
  { title: "Aide Familiale", description: "Prendre en charge une corvée surprise.", duration: 5, icon: "🏠", color: "bg-indigo-300" },

  // --- ALTRUISME & AIDE ---
  { title: "Geste de Bonté", description: "Aider un inconnu dans la rue.", duration: 3, icon: "🤝", color: "bg-emerald-400" },
  { title: "Don de Soi", description: "Faire un don (vêtements, temps, argent).", duration: 1, icon: "🎁", color: "bg-rose-500" },
  { title: "Éco-Guerrier", description: "Ramasser 5 déchets en marchant.", duration: 7, icon: "♻️", color: "bg-green-700" },
  { title: "Soutien Local", description: "Acheter chez un petit artisan.", duration: 3, icon: "🏪", color: "bg-orange-700" },
  { title: "Poste de Bienveillance", description: "Envoyer un mot d'encouragement.", duration: 5, icon: "💌", color: "bg-pink-400" },
  
  // --- VIE QUOTIDIENNE ---
  { title: "Coucher Solaire", description: "Éteindre les écrans à 21h30.", duration: 21, icon: "🌙", color: "bg-indigo-900" },
  { title: "Réveil de Paix", description: "Pas de téléphone durant la 1ère heure.", duration: 14, icon: "📵", color: "bg-slate-800" },
  { title: "Zéro Sucre", description: "Pas de sucre transformé aujourd'hui.", duration: 7, icon: "🚫", color: "bg-red-600" },
  { title: "Méditation Express", description: "5 min de silence total.", duration: 30, icon: "🧘‍♂️", color: "bg-teal-300" },
  { title: "Posture Royale", description: "Se tenir droit devant son ordi.", duration: 10, icon: "🧍", color: "bg-emerald-600" },
  { title: "Journal Intime", description: "Écrire ses pensées du jour.", duration: 7, icon: "📓", color: "bg-slate-500" }
];

export const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Méditation 5 min', category: Category.MORNING, completed: false, time: '07:00', dueDate: null, icon: '🧘' },
  { id: '2', name: 'Hydratation', category: Category.MORNING, completed: false, time: '07:15', dueDate: null, icon: '💧' },
];

export const DEFAULT_CHALLENGES: Challenge[] = [
  { 
    id: 'c1', 
    title: '7 Jours de Zen', 
    description: 'Méditer chaque matin pendant une semaine complète.', 
    duration: 7, 
    currentDay: 0, 
    icon: '🧘‍♂️', 
    color: 'bg-emerald-500' 
  }
];

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.MORNING]: 'Matin',
  [Category.AFTERNOON]: 'Après-midi',
  [Category.EVENING]: 'Soir',
  [Category.NIGHT]: 'Nuit',
};
