
import { GoogleGenAI, Type } from "@google/genai";
import { GrowthStrategy, ProfileInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateGrowthStrategy(profile: ProfileInfo): Promise<GrowthStrategy> {
  const prompt = `Act as a world-class Social Media Growth Hacker. 
  Create a detailed growth strategy and simulation for a ${profile.platform} account in the ${profile.niche} niche.
  The user currently has ${profile.currentFollowers} followers and wants to reach ${profile.targetFollowers}.
  
  Generate a 14-day growth projection simulation where they can realistically hit their goals through high-engagement content and reaction triggers.
  Provide exactly 14 data points for the timeline.`;

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
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            viralHooks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "summary", "projectedFollowers", "projectedReactions", "timeline", "actionItems", "viralHooks"]
        }
      }
    });

    if (!response.text) {
      throw new Error("The AI returned an empty response. Please try again.");
    }

    const data = JSON.parse(response.text);
    return data as GrowthStrategy;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("Invalid or missing API Key. Please ensure your environment is configured correctly.");
    }
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the growth strategy. The AI output was malformed.");
    }
    throw new Error(error.message || "An unexpected error occurred while generating your strategy.");
  }
}
