
export enum Category {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT'
}

export interface Habit {
  id: string;
  name: string;
  category: Category;
  completed: boolean;
  time?: string;
  dueDate: string | null;
  icon: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number;
  currentDay: number;
  lastCompletedDate?: string;
  icon: string;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'xp' | 'level' | 'quest' | 'info';
  read: boolean;
}

export interface AIRoutineSuggestion {
  time: string;
  activity: string;
  benefit: string;
  icon: string;
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface HeroicTitle {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  totalXp: number;
  streak: number;
  lastLoginDate: string | null;
  selectedTitleId?: string;
  unlockedTitleIds: string[];
  totalHabitsCompleted: number;
  totalChallengesCompleted: number;
  totalFocusMinutes: number;
  userName?: string;
}
