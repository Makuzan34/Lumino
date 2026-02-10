
import { Category, Habit, Challenge, HeroicTitle, Rarity, Recurrence, Difficulty } from './types';

export const XP_PER_HABIT = 15; // Base, mais on utilise le record ci-dessous
export const XP_PER_CHALLENGE_DAY = 50; // Base

export const HABIT_XP_VALUES: Record<Difficulty, number> = {
  [Difficulty.EASY]: 5,
  [Difficulty.MEDIUM]: 15,
  [Difficulty.HARD]: 35,
  [Difficulty.HEROIC]: 75
};

export const CHALLENGE_XP_VALUES: Record<Difficulty, number> = {
  [Difficulty.EASY]: 25,
  [Difficulty.MEDIUM]: 50,
  [Difficulty.HARD]: 120,
  [Difficulty.HEROIC]: 250
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'Facile',
  [Difficulty.MEDIUM]: 'Moyen',
  [Difficulty.HARD]: 'Difficile',
  [Difficulty.HEROIC]: 'Héroïque'
};

export const XP_CHALLENGE_COMPLETE = 200;
export const MAX_LEVEL = 100;

export const GET_RANK = (level: number): string => {
  if (level >= 100) return 'Divinité de l\'Ordre Éternel 🌌';
  if (level >= 80) return 'Grand Maître de l\'Équilibre';
  if (level >= 60) return 'Seigneur de la Discipline';
  if (level >= 40) return 'Chevalier de la Lumière';
  if (level >= 20) return 'Éclaireur des Terres Neuves';
  return 'Aventurier de Lumino';
};

export const DAILY_QUOTES = [
  "Le courage commence par un simple geste.",
  "Chaque habitude est une brique de votre citadelle.",
  "La discipline est le pont entre les rêves et la réalité.",
  "Le calme est l'arme suprême du guerrier.",
  "Un foyer ordonné est un sanctuaire impénétrable.",
  "Maîtrisez votre or, maîtrisez votre destin.",
  "L'esprit est un temple qui se construit chaque jour.",
  "L'amour est la magie la plus ancienne et la plus puissante."
];

const generateTitles = (): HeroicTitle[] => {
  const titles: HeroicTitle[] = [];
  const baseNames = [
    "Vagabond", "Sentinelle", "Apprenti", "Guerrier", "Mage", "Assassin", "Paladin", "Alchimiste", 
    "Chasseur", "Seigneur", "Invocateur", "Moine", "Barde", "Prêtre", "Ombre", "Chevalier", 
    "Archiviste", "Titan", "Rôdeur", "Éclaireur", "Gardien", "Druide", "Nécromancien", "Héraut",
    "Oracle", "Vigile", "Berserker", "Lame", "Esprit", "Nomade", "Pèlerin", "Sage", "Maître",
    "Souverain", "Inquisiteur", "Apôtre", "Templier", "Vanguard", "Régent", "Prétorien", "Avatar",
    "Exilé", "Légat", "Prodige", "Héritier", "Sentinelle", "Faucheur", "Veilleur", "Céleste"
  ];
  const descriptors = [
    "des Brumes", "de l'Aube", "du Zénith", "du Crépuscule", "du Silence", "de Cristal", 
    "de l'Éther", "des Arcanes", "du Néant", "de Jade", "d'Argent", "de l'Éternité", 
    "de Mercure", "du Destin", "d'Émeraude", "du Savoir", "de Wyvernes", "de la Nuit", 
    "des Cieux", "de la Terre", "du Sang", "de l'Or", "des Tempêtes", "des Esprits", 
    "de la Faille", "du Chaos", "du Givre", "du Soleil Noir", "des Abysses", "de Flammes",
    "du Vent d'Est", "des Anciens", "de la Forêt Blanche", "des Sables Rouges",
    "de la Flamme Vive", "des Secrets Perdus", "du Chaos Originel", "de l'Astre Pur",
    "des Profondeurs", "du Murmure Sourd", "de la Lumière Primordiale", "du Trône de Fer",
    "des Marches Grises", "de l'Éclipse", "du Firmament", "de l'Infini", "du Phénix", "du Lion Noir"
  ];

  let idCounter = 1;
  const usedNames = new Set<string>();
  while (titles.length < 300) {
    const base = baseNames[idCounter % baseNames.length];
    const desc = descriptors[Math.floor(idCounter / baseNames.length) % descriptors.length];
    const name = `${base} ${desc}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      // Ajustement de la rareté pour 300 titres (4 tranches de 75)
      const rarityIndex = Math.floor(titles.length / 75);
      const rarity: Rarity = rarityIndex === 0 ? 'common' : rarityIndex === 1 ? 'rare' : rarityIndex === 2 ? 'epic' : 'legendary';
      const type = idCounter % 4; 
      let condition: (s: any) => boolean;
      let reqText = "";
      if (type === 0) {
        const lv = Math.min(100, Math.floor(idCounter / 2) + 1);
        condition = (s) => s.level >= lv;
        reqText = `Atteindre le Niveau ${lv}`;
      } else if (type === 1) {
        const strk = Math.min(100, Math.floor(idCounter / 4) + 2);
        condition = (s) => s.streak >= strk;
        reqText = `Série de ${strk} jours`;
      } else if (type === 2) {
        const hab = idCounter * 5;
        condition = (s) => s.totalHabitsCompleted >= hab;
        reqText = `${hab} Habitudes complétées`;
      } else {
        const foc = idCounter * 15;
        condition = (s) => s.totalFocusMinutes >= foc;
        reqText = `${foc} min de Focus total`;
      }
      titles.push({ id: `title-${idCounter}`, name: name, description: `Forger votre légende.`, requirementText: reqText, rarity: rarity, condition: condition });
    }
    idCounter++;
  }
  return titles;
};

export const HEROIC_TITLES = generateTitles();

const generateQuestLibrary = (): Omit<Challenge, 'id' | 'currentDay' | 'lastCompletedDate'>[] => {
  const questThemes = [
    { t: "L'Épreuve d'Or", d: "Dominez vos finances pour sécuriser votre avenir.", i: "💰", c: "bg-emerald-600", topic: "Finance" },
    { t: "La Voie de la Renaissance", d: "Purifiez votre corps et votre esprit quotidiennement.", i: "🧘", c: "bg-indigo-600", topic: "Wellness" },
    { t: "L'Éveil de l'Esprit", d: "Dépassez vos limites intellectuelles et personnelles.", i: "🧠", c: "bg-amber-600", topic: "Self Improvement" },
    { t: "L'Ordre du Sanctuaire", d: "Maintenez l'équilibre parfait dans votre environnement.", i: "🧹", c: "bg-slate-600", topic: "Organization" },
    { t: "Le Labeur du Maître", d: "Excellez dans votre art et votre carrière professionnelle.", i: "⚙️", c: "bg-blue-600", topic: "Working" },
    { t: "Le Savoir des Anciens", d: "Découvrez les secrets cachés dans les livres et les études.", i: "📜", c: "bg-cyan-600", topic: "Studying" },
    { t: "La Symphonie Divine", d: "Exprimez votre âme à travers la musique et les sons.", i: "🪕", c: "bg-rose-500", topic: "Music" },
    { t: "L'Appel du Sauvage", d: "Reconnectez-vous avec les forces de la nature.", i: "🌲", c: "bg-green-600", topic: "Outdoor" },
    { t: "L'Odyssée lointaine", d: "Explorez de nouveaux horizons et cultures.", i: "🧳", c: "bg-orange-500", topic: "Travelling" },
    { t: "Le Cercle de l'Amitié", d: "Fortifiez vos liens avec les autres aventuriers.", i: "🍽️", c: "bg-purple-600", topic: "Social" }
  ];

  const suffixes = [
    "Éternelle", "du Destin", "de la Faille", "du Crépuscule", "du Zénith", "du Renouveau", "de l'Abîme", "de la Victoire", "du Sage", "de l'Aube",
    "des Anciens", "de Lumino", "du Grand Voyageur", "des Arcanes", "du Maître des Lames", "de la Paix Intérieure", "de la Prospérité", "des Vents", "des Marées", "du Feu Sacré"
  ];

  const quests: Omit<Challenge, 'id' | 'currentDay' | 'lastCompletedDate'>[] = [];
  for (let i = 0; i < 1000; i++) {
    const theme = questThemes[i % questThemes.length];
    const suffix = suffixes[Math.floor(i / questThemes.length) % suffixes.length];
    const duration = 21 + (Math.floor(i / 100) * 7);
    
    quests.push({
      title: `${theme.t} ${suffix}`,
      description: `[Thématique: ${theme.topic}] ${theme.d} Maintenez la discipline pendant ${duration} jours.`,
      duration: duration,
      icon: theme.i,
      color: theme.c,
      difficulty: Difficulty.MEDIUM
    });
  }
  return quests;
};

export const QUEST_LIBRARY = generateQuestLibrary();

export const HABIT_TEMPLATES: { name: string; icon: string; category: Category }[] = [
  { name: "Analyse du Trésor", icon: "💰", category: Category.MORNING },
  { name: "Scellage des Dépenses", icon: "🛡️", category: Category.EVENING },
  { name: "Offrande à l'Épargne", icon: "🏦", category: Category.MORNING },
  { name: "Investissement des Sages", icon: "📈", category: Category.MORNING },
  { name: "Revue des Revenus", icon: "💸", category: Category.EVENING },
  { name: "Budget de l'Aventurier", icon: "📊", category: Category.AFTERNOON },
  { name: "Chasse aux Soldes", icon: "🏷️", category: Category.AFTERNOON },
  { name: "Purge des Abonnements", icon: "✂️", category: Category.EVENING },
  { name: "Étude du Marché", icon: "🔍", category: Category.MORNING },
  { name: "Don aux Nécessiteux", icon: "🎁", category: Category.EVENING },
  { name: "Vente d'Objets Anciens", icon: "📦", category: Category.AFTERNOON },
  { name: "Plan de Fortune 5 ans", icon: "🔮", category: Category.NIGHT },
  { name: "Factures Honorées", icon: "🧾", category: Category.EVENING },
  { name: "Réunion Fiscale", icon: "⚖️", category: Category.MORNING },
  { name: "Crypto-Alchimie", icon: "🪙", category: Category.NIGHT },
  { name: "Économie de Cristal", icon: "💎", category: Category.MORNING },
  { name: "Négociation de Guilde", icon: "🤝", category: Category.AFTERNOON },
  { name: "Lecture de l'Or", icon: "📙", category: Category.EVENING },
  { name: "Protection du Butin", icon: "🔒", category: Category.NIGHT },
  { name: "Audit de l'Héritage", icon: "📜", category: Category.AFTERNOON },
  { name: "Rituel de Méditation", icon: "🧘", category: Category.MORNING },
  { name: "Bain de Renaissance", icon: "🛀", category: Category.NIGHT },
  { name: "Hydratation de Vie", icon: "💧", category: Category.MORNING },
  { name: "Yoga du Lotus", icon: "💮", category: Category.MORNING },
  { name: "Massage des Guerriers", icon: "💆", category: Category.EVENING },
  { name: "Sommeil des Titans", icon: "💤", category: Category.NIGHT },
  { name: "Respiration de l'Éther", icon: "🌬️", category: Category.AFTERNOON },
  { name: "Détente au Sauna", icon: "🧖", category: Category.EVENING },
  { name: "Soin de l'Armure (Peau)", icon: "🧴", category: Category.MORNING },
  { name: "Silence de l'Ermite", icon: "🤐", category: Category.NIGHT },
  { name: "Thé des Sages", icon: "🍵", category: Category.EVENING },
  { name: "Étirements Divins", icon: "🙆", category: Category.MORNING },
  { name: "Guérison Naturelle", icon: "🌿", category: Category.AFTERNOON },
  { name: "Lumière du Soleil", icon: "☀️", category: Category.MORNING },
  { name: "Journal de Gratitude", icon: "🙏", category: Category.EVENING },
  { name: "Pause de l'Oracle", icon: "👁️", category: Category.AFTERNOON },
  { name: "Harmonie Musicale", icon: "🎶", category: Category.NIGHT },
  { name: "Affirmations de Pouvoir", icon: "🗣️", category: Category.MORNING },
  { name: "Spa de l'Aube", icon: "✨", category: Category.MORNING },
  { name: "Refuge Sensoriel", icon: "🕯️", category: Category.NIGHT },
  { name: "Écriture de Légende", icon: "✍️", category: Category.MORNING },
  { name: "Lecture de Grimoires", icon: "📖", category: Category.EVENING },
  { name: "Apprentissage d'Arcanes", icon: "🧠", category: Category.MORNING },
  { name: "Conférence des Maîtres", icon: "🎤", category: Category.AFTERNOON },
  { name: "Défier sa Peur", icon: "🦁", category: Category.AFTERNOON },
  { name: "Discipline de Fer", icon: "🛡️", category: Category.MORNING },
  { name: "Revue de la Quête", icon: "📋", category: Category.EVENING },
  { name: "Podcasts Erudits", icon: "🎧", category: Category.AFTERNOON },
  { name: "Vision du Destin", icon: "🗺️", category: Category.MORNING },
  { name: "Éliminer un Vice", icon: "🚫", category: Category.NIGHT },
  { name: "Parler une Langue", icon: "🗣️", category: Category.MORNING },
  { name: "Pratique du Code", icon: "💻", category: Category.AFTERNOON },
  { name: "Public Speaking", icon: "📢", category: Category.AFTERNOON },
  { name: "Gestion du Temps", icon: "⌛", category: Category.MORNING },
  { name: "Pensée Critique", icon: "🤔", category: Category.EVENING },
  { name: "Empathie du Héraut", icon: "❤️", category: Category.AFTERNOON }, 
  { name: "Réseautage de Cour", icon: "🌐", category: Category.AFTERNOON },
  { name: "Modestie du Sage", icon: "🌾", category: Category.NIGHT },
  { name: "Confiance de Titan", icon: "⚡", category: Category.MORNING },
  { name: "Leadership de Roi", icon: "👑", category: Category.AFTERNOON },
  { name: "Nettoyage du Sanctuaire", icon: "🧹", category: Category.AFTERNOON },
  { name: "Tri des Reliques", icon: "📂", category: Category.EVENING },
  { name: "Planification d'Assaut", icon: "📅", category: Category.MORNING },
  { name: "Désencombrement", icon: "🗑️", category: Category.AFTERNOON },
  { name: "Lessive des Armes", icon: "🧺", category: Category.AFTERNOON },
  { name: "Inbox Zero", icon: "📧", category: Category.EVENING },
  { name: "Réglage d'Horloge", icon: "⏰", category: Category.MORNING },
  { name: "Inventaire Sac à Dos", icon: "🎒", category: Category.EVENING },
  { name: "Préparation de Repas", icon: "🍱", category: Category.EVENING },
  { name: "Courses de la Ville", icon: "🛒", category: Category.AFTERNOON },
  { name: "Papiers en Ordre", icon: "📁", category: Category.AFTERNOON },
  { name: "Nettoyage Digital", icon: "💾", category: Category.NIGHT },
  { name: "Rangement du Garage", icon: "🔨", category: Category.AFTERNOON },
  { name: "Lustrage des Vitres", icon: "🪟", category: Category.AFTERNOON },
  { name: "Maintenance Maison", icon: "🏠", category: Category.AFTERNOON },
  { name: "Gestion des Clefs", icon: "🔑", category: Category.EVENING },
  { name: "Archive de Vie", icon: "🗄️", category: Category.NIGHT },
  { name: "Décoration Sanctuaire", icon: "🖼️", category: Category.AFTERNOON },
  { name: "Fleurs de l'Autel", icon: "💐", category: Category.MORNING },
  { name: "Arrosage du Domaine", icon: "🚿", category: Category.MORNING },
  { name: "Labeur Concentré", icon: "⚙️", category: Category.MORNING },
  { name: "Conseil de Guerre", icon: "👥", category: Category.AFTERNOON },
  { name: "Rédaction de Rapports", icon: "📄", category: Category.AFTERNOON },
  { name: "Prospection Terres", icon: "📞", category: Category.MORNING },
  { name: "Vente de Sorts", icon: "💼", category: Category.AFTERNOON },
  { name: "Code Arcanique", icon: "💻", category: Category.MORNING },
  { name: "Design de Glyphes", icon: "🎨", category: Category.AFTERNOON },
  { name: "Pause du Travailleur", icon: "☕", category: Category.AFTERNOON },
  { name: "Analyse de Données", icon: "📉", category: Category.MORNING },
  { name: "Gestion de Projet", icon: "🏗️", category: Category.AFTERNOON },
  { name: "Révision de Contrats", icon: "✍️", category: Category.MORNING },
  { name: "Formation de Recrues", icon: "🎓", category: Category.AFTERNOON },
  { name: "Networking Guilde", icon: "🤝", category: Category.AFTERNOON },
  { name: "Évènement de Guilde", icon: "🎪", category: Category.EVENING },
  { name: "Revue des Erreurs", icon: "⚠️", category: Category.EVENING },
  { name: "Tests de Robustesse", icon: "🧪", category: Category.AFTERNOON },
  { name: "Optimisation Flux", icon: "🔄", category: Category.MORNING },
  { name: "Vision Stratégique", icon: "🔭", category: Category.MORNING },
  { name: "Bilan Hebdomadaire", icon: "🏁", category: Category.EVENING },
  { name: "Clôture du Chantier", icon: "🚧", category: Category.EVENING },
  { name: "Savoir des Anciens", icon: "📜", category: Category.MORNING },
  { name: "Flashcards Magiques", icon: "🃏", category: Category.AFTERNOON },
  { name: "Lecture de Thèses", icon: "📓", category: Category.EVENING },
  { name: "Laboratoire d'Alchimie", icon: "⚗️", category: Category.AFTERNOON },
  { name: "Cours de l'Académie", icon: "🏫", category: Category.MORNING },
  { name: "Examen de Passage", icon: "📝", category: Category.AFTERNOON },
  { name: "Théorie des Cordes", icon: "🧶", category: Category.NIGHT },
  { name: "Apprentissage IA", icon: "🤖", category: Category.MORNING },
  { name: "Histoire de Lumino", icon: "🏺", category: Category.EVENING },
  { name: "Géographie du Monde", icon: "🗺️", category: Category.AFTERNOON },
  { name: "Astronomie Céleste", icon: "🔭", category: Category.NIGHT },
  { name: "Biologie des Créatures", icon: "🧬", category: Category.MORNING },
  { name: "Droit des Royaumes", icon: "⚖️", category: Category.AFTERNOON },
  { name: "Philosophie Antique", icon: "🏛️", category: Category.EVENING },
  { name: "Mathématiques Sacrées", icon: "🔢", category: Category.MORNING },
  { name: "Psychologie de l'Âme", icon: "🧠", category: Category.EVENING },
  { name: "Anatomie de Titan", icon: "🦴", category: Category.AFTERNOON },
  { name: "Botanique Magique", icon: "🍃", category: Category.MORNING },
  { name: "Apprendre à Apprendre", icon: "💡", category: Category.NIGHT },
  { name: "Débat d'idées", icon: "💬", category: Category.AFTERNOON },
  { name: "Pratique de la Luth", icon: "🪕", category: Category.EVENING },
  { name: "Composition de Chant", icon: "🎼", category: Category.EVENING },
  { name: "Solfège des Sphères", icon: "🎵", category: Category.MORNING },
  { name: "Accordage des Cordes", icon: "🎻", category: Category.MORNING },
  { name: "Improvisation Jazz", icon: "🎷", category: Category.AFTERNOON },
  { name: "Chants de Bataille", icon: "🥁", category: Category.AFTERNOON },
  { name: "Piano des Nuages", icon: "🎹", category: Category.EVENING },
  { name: "Guitare de Feu", icon: "🎸", category: Category.EVENING },
  { name: "Chant Grégorien", icon: "🎤", category: Category.MORNING },
  { name: "Écoute de l'Harmonie", icon: "🎶", category: Category.NIGHT },
  { name: "Théorie Musicale", icon: "📖", category: Category.MORNING },
  { name: "Mixage d'Essence", icon: "🎚️", category: Category.NIGHT },
  { name: "Découverte de Barde", icon: "📻", category: Category.AFTERNOON },
  { name: "Concert de Guilde", icon: "🎟️", category: Category.EVENING },
  { name: "Flûte Enchantée", icon: "🪈", category: Category.AFTERNOON },
  { name: "Écrire une Partition", icon: "🖋️", category: Category.NIGHT },
  { name: "Rythme de Tambour", icon: "🪘", category: Category.MORNING },
  { name: "Mémoriser Paroles", icon: "🧠", category: Category.EVENING },
  { name: "Nettoyer Instrument", icon: "🧽", category: Category.AFTERNOON },
  { name: "Performance Solo", icon: "🌟", category: Category.NIGHT },
  { name: "Marche en Forêt", icon: "🌲", category: Category.AFTERNOON },
  { name: "Vélo des Plaines", icon: "🚲", category: Category.MORNING },
  { name: "Jardinage Zen", icon: "🌻", category: Category.MORNING },
  { name: "Randonnée des Cimes", icon: "🥾", category: Category.AFTERNOON },
  { name: "Course des Lièvres", icon: "🏃", category: Category.MORNING },
  { name: "Camping de l'Aube", icon: "⛺", category: Category.MORNING },
  { name: "Escalade du Titan", icon: "🧗", category: Category.AFTERNOON },
  { name: "Nage de la Sirène", icon: "🏊", category: Category.AFTERNOON },
  { name: "Observation d'Oiseaux", icon: "🔭", category: Category.MORNING },
  { name: "Photographie Nature", icon: "📸", category: Category.AFTERNOON },
  { name: "Pique-nique de Roi", icon: "🧺", category: Category.AFTERNOON },
  { name: "Kayak des Rivières", icon: "🛶", category: Category.AFTERNOON },
  { name: "Surf des Tempêtes", icon: "🏄", category: Category.AFTERNOON },
  { name: "Feu de Joie", icon: "🔥", category: Category.EVENING },
  { name: "Pêche au Calme", icon: "🎣", category: Category.MORNING },
  { name: "Ramassage Déchets", icon: "🚮", category: Category.AFTERNOON },
  { name: "Star Gazing", icon: "🌌", category: Category.NIGHT },
  { name: "Balade au Clair Lune", icon: "🌙", category: Category.NIGHT },
  { name: "Course à Pied", icon: "👟", category: Category.MORNING },
  { name: "Parkour Urbain", icon: "🏙️", category: Category.AFTERNOON },
  { name: "Préparer le Bagage", icon: "🧳", category: Category.EVENING },
  { name: "Planifier l'Odyssée", icon: "🗺️", category: Category.MORNING },
  { name: "Check Billets Volants", icon: "🎟️", category: Category.AFTERNOON },
  { name: "Langue Locale", icon: "🗣️", category: Category.MORNING },
  { name: "Culture des Terres", icon: "🏮", category: Category.EVENING },
  { name: "Change de Monnaie", icon: "💱", category: Category.AFTERNOON },
  { name: "Passeport du Monde", icon: "🛂", category: Category.MORNING },
  { name: "Check Assurance Voyage", icon: "🛡️", category: Category.AFTERNOON },
  { name: "Réserver l'Auberge", icon: "🏨", category: Category.EVENING },
  { name: "Cartographie GPS", icon: "📍", category: Category.MORNING },
  { name: "Dégustation Étrangère", icon: "🍜", category: Category.AFTERNOON },
  { name: "Journal de Voyage", icon: "📓", category: Category.NIGHT },
  { name: "Souvenirs de Quête", icon: "🏺", category: Category.EVENING },
  { name: "Transport local", icon: "🚆", category: Category.AFTERNOON },
  { name: "Rencontre Nomades", icon: "👋", category: Category.AFTERNOON },
  { name: "Explore Vieille Ville", icon: "🏛️", category: Category.AFTERNOON },
  { name: "Check-in Vol", icon: "✈️", category: Category.MORNING },
  { name: "Vidéos de l'Aventure", icon: "🎥", category: Category.NIGHT },
  { name: "Cartes Postales", icon: "✉️", category: Category.EVENING },
  { name: "Itinéraire Sac à Dos", icon: "🗺️", category: Category.NIGHT },
  { name: "Dîner de Guilde", icon: "🍽️", category: Category.EVENING },
  { name: "Appel aux Proches", icon: "📞", category: Category.EVENING },
  { name: "Jeux de Société", icon: "🎲", category: Category.EVENING },
  { name: "Visite au Temple", icon: "⛩️", category: Category.MORNING },
  { name: "Bénévolat de Ville", icon: "🤝", category: Category.AFTERNOON },
  { name: "Célébration d'Anniv", icon: "🎂", category: Category.EVENING },
  { name: "Cinéma des Songes", icon: "🍿", category: Category.NIGHT },
  { name: "Musée des Anciens", icon: "🖼️", category: Category.AFTERNOON },
  { name: "Théâtre Royal", icon: "🎭", category: Category.EVENING },
  { name: "Danse de Salon", icon: "💃", category: Category.NIGHT },
  { name: "Soins aux Animaux", icon: "🐈", category: Category.MORNING },
  { name: "Dressage du Loup", icon: "🐕", category: Category.AFTERNOON },
  { name: "Check des Emails", icon: "📧", category: Category.MORNING },
  { name: "Maintenance PC", icon: "🔧", category: Category.NIGHT },
  { name: "Backup Données", icon: "☁️", category: Category.NIGHT },
  { name: "Cuisine Royale", icon: "👨‍🍳", category: Category.EVENING },
  { name: "Bricolage d'Objets", icon: "🔨", category: Category.AFTERNOON },
  { name: "Prière ou Gratitude", icon: "🙏", category: Category.NIGHT },
  { name: "Écoute de l'Inconnu", icon: "👂", category: Category.AFTERNOON },
  { name: "Partage de Savoir", icon: "📢", category: Category.AFTERNOON }
];

export const DEFAULT_HABITS: Habit[] = [
  // Added mandatory properties to follow Habit interface
  { id: '1', name: "L'Appel de l'Eau", category: Category.MORNING, completed: false, time: '07:30', startDate: '2024-01-01', dueDate: null, icon: '💧', recurrence: Recurrence.DAILY, difficulty: Difficulty.EASY, completionHistory: [], currentStreak: 0, bestStreak: 0 },
  { id: '2', name: "Dressage du Nid", category: Category.MORNING, completed: false, time: '07:45', startDate: '2024-01-01', dueDate: null, icon: '🛏️', recurrence: Recurrence.DAILY, difficulty: Difficulty.EASY, completionHistory: [], currentStreak: 0, bestStreak: 0 },
];

export const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'Le Chemin de la Fortune', description: 'Dominez vos finances pour libérer votre esprit.', duration: 21, currentDay: 0, icon: '💰', color: 'bg-emerald-600', difficulty: Difficulty.MEDIUM }
];

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.MORNING]: 'Matin',
  [Category.AFTERNOON]: 'Après-midi',
  [Category.EVENING]: 'Soir',
  [Category.NIGHT]: 'Nuit',
};
