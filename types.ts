
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

export interface RecurrenceRule {
  interval: number;
  daysOfWeek?: number[]; 
  dayOfMonth?: number;  
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: Category;
  completed: boolean;
  time?: string;
  startDate: string; 
  dueDate: string | null;
  icon: string;
  recurrence: Recurrence;
  recurrenceRule?: RecurrenceRule;
  difficulty: Difficulty;
  notifiedDate?: string;
  completionHistory: string[]; // Dates au format ISO YYYY-MM-DD
  currentStreak: number;
  bestStreak: number;
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

export interface MoodLog {
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
}

export interface GrowthInsight {
  id: string;
  title: string;
  content: string;
  category: 'psychologie' | 'productivité' | 'santé' | 'finance';
  read: boolean;
  timestamp: number;
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
  lastRefreshDate: string | null;
  selectedTitleId?: string;
  unlockedTitleIds: string[];
  totalHabitsCompleted: number;
  totalChallengesCompleted: number;
  totalFocusMinutes: number;
  moodLogs: MoodLog[];
  userName?: string;
}
