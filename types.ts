
export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'threads';

export interface GrowthStrategy {
  title: string;
  summary: string;
  projectedFollowers: number;
  projectedReactions: number;
  timeline: { day: number; followers: number; reactions: number }[];
  actionItems: string[];
  viralHooks: string[];
  bestPostingTimes: string[];
  recommendedHashtags: string[];
}

export interface ProfileInfo {
  platform: Platform;
  niche: string;
  currentFollowers: number;
  targetFollowers: number;
}

export interface ViralScoreResult {
  score: number;
  analysis: string;
  suggestions: string[];
}

export interface BoostLog {
  timestamp: string;
  message: string;
  status: 'info' | 'success' | 'warning';
}

export interface BoostResult {
  token: string;
  logs: BoostLog[];
  estimatedCompletion: string;
}
