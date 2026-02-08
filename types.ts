
export enum Category {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT'
}

export enum Recurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  HEROIC = 'HEROIC'
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: Category;
  completed: boolean;
  time?: string;
  dueDate: string | null;
  icon: string;
  recurrence: Recurrence;
  difficulty: Difficulty;
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
  difficulty: Difficulty;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'xp' | 'level' | 'quest' | 'info';
  read: boolean;
}

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface HeroicTitle {
  id: string;
  name: string;
  description: string;
  requirementText: string;
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
