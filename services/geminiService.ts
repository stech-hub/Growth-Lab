
import { GoogleGenAI, Type } from "@google/genai";
import { GrowthStrategy, ProfileInfo, ViralScoreResult, BoostResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateGrowthStrategy(profile: ProfileInfo): Promise<GrowthStrategy> {
  const prompt = `Act as a world-class Social Media Growth Architect. 
  Create a highly sophisticated growth strategy and numerical simulation for a ${profile.platform} account in the ${profile.niche} niche.
  Current: ${profile.currentFollowers} followers. Goal: ${profile.targetFollowers}.
  
  Tailor the strategy specifically for ${profile.platform}'s current 2025 algorithm.
  Generate a 14-day growth projection simulation.
  Include: 
  1. A title and summary.
  2. 14 data points for timeline.
  3. Platform-specific action items.
  4. 5 Viral hooks.
  5. 3 Best posting times.
  6. 10 trending hashtags/keywords.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            projectedFollowers: { type: Type.NUMBER },
            projectedReactions: { type: Type.NUMBER },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  followers: { type: Type.NUMBER },
                  reactions: { type: Type.NUMBER }
                },
                required: ["day", "followers", "reactions"]
              }
            },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
            bestPostingTimes: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedHashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "summary", "projectedFollowers", "projectedReactions", "timeline", "actionItems", "viralHooks", "bestPostingTimes", "recommendedHashtags"]
        }
      }
    });

    if (!response.text) throw new Error("Empty AI response.");
    return JSON.parse(response.text) as GrowthStrategy;
  } catch (error: any) {
    throw new Error(error.message || "Failed to generate architecture.");
  }
}

export async function analyzeViralPotential(content: string, platform: string): Promise<ViralScoreResult> {
  const prompt = `Analyze the viral potential of this ${platform} post content: "${content}". 
  Provide a score from 0-100, a detailed psychological analysis, and 3 specific suggestions.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "analysis", "suggestions"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as ViralScoreResult;
  } catch (err) {
    throw new Error("Viral analysis failed.");
  }
}

export async function initializeBoostSequence(url: string, platform: string, count: number): Promise<BoostResult> {
  const prompt = `Act as an Elite Engagement Engineer. Generate a technical-sounding "Boost Injection Sequence" log for this ${platform} URL: ${url}. 
  The goal is to trigger ${count} reactions/likes through simulated "Algorithm Resonance". 
  Generate 8 log entries that look like technical terminal output (e.g., "Pinging Meta-API endpoints...", "Injecting SEO Meta-tags..."). 
  Also provide a unique 'Pulse Token' and an estimated completion time.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            token: { type: Type.STRING },
            estimatedCompletion: { type: Type.STRING },
            logs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  message: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['info', 'success', 'warning'] }
                },
                required: ["timestamp", "message", "status"]
              }
            }
          },
          required: ["token", "estimatedCompletion", "logs"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as BoostResult;
  } catch (err) {
    throw new Error("Boost initialization failed.");
  }
}
