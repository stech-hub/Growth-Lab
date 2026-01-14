
export interface GrowthStrategy {
  title: string;
  summary: string;
  projectedFollowers: number;
  projectedReactions: number;
  timeline: { day: number; followers: number; reactions: number }[];
  actionItems: string[];
  viralHooks: string[];
}

export interface ProfileInfo {
  platform: 'facebook' | 'instagram' | 'tiktok';
  niche: string;
  currentFollowers: number;
  targetFollowers: number;
}
