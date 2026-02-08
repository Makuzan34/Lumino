
import { GoogleGenAI } from "@google/genai";
import { DAILY_QUOTES } from "../constants";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyWellnessTip = async (): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Donne-moi un conseil de vie ultra-court et puissant (max 7 mots) en français. Thème aléatoire : discipline, calme, argent, famille ou sport.",
      config: {
        systemInstruction: "Tu es une voix de sagesse minimaliste. Pas de ponctuation excessive. Direct et inspirant.",
      }
    });
    return response.text?.replace(/[".]/g, '') || DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
  } catch (error) {
    console.error("Gemini Error:", error);
    return DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
  }
};
