export type CourseCategory =
  | 'Engineering'
  | 'Design'
  | 'Data'
  | 'Strategy'
  | 'Communication';

export type CourseLevel = 'Foundations' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Lesson {
  id: string;
  title: string;
  durationMin: number;
  completed: boolean;
  current?: boolean;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: CourseCategory;
  level: CourseLevel;
  instructor: string;
  instructorTitle: string;
  totalLessons: number;
  completedLessons: number;
  totalMinutes: number;
  xpReward: number;
  skills: string[];
  lessons: Lesson[];
  coverAccent: 'blueprint' | 'brass' | 'signal' | 'moss';
  isContinue?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  target: number;
  icon: 'target' | 'flame' | 'brain' | 'check' | 'zap';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: 'medal' | 'flame' | 'trophy' | 'award' | 'star' | 'zap';
  unlocked: boolean;
  date?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Skill {
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  category: CourseCategory;
}

export interface UserProfile {
  name: string;
  title: string;
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  xpInLevel: number;
  streak: number;
  streakBest: number;
  rank: string;
  rankPercentile: number;
  weeklyGoalMinutes: number;
  weeklyMinutesCompleted: number;
  skills: Skill[];
}
