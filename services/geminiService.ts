
import { GoogleGenAI, Type } from "@google/genai";
import { DAILY_QUOTES } from "../constants";
import { GrowthInsight } from "../types";

// Always initialize with named parameter and use process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches an inspiring wellness tip using Gemini Flash.
 */
export const getDailyWellnessTip = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Fournis un conseil de bien-être ou de productivité extrêmement court (max 12 mots) pour un héros du quotidien. Le ton doit être solennel, inspirant et évoquer un monde de fantasy moderne.",
    });
    // Access response text property directly (getter)
    return response.text?.trim() || DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
  } catch (error) {
    console.error("Gemini API Error (Wellness Tip):", error);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }
};

/**
 * Generates a deep growth insight using Gemini Flash and JSON schema for structured data.
 */
export const getGrowthInsight = async (): Promise<GrowthInsight> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Génère un conseil de croissance personnelle unique et profond, relevant de la psychologie, productivité, santé ou finance. Structure-le en JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Un titre majestueux pour ce conseil" },
            content: { type: Type.STRING, description: "L'explication détaillée du conseil" },
            category: { 
              type: Type.STRING, 
              enum: ['psychologie', 'productivité', 'santé', 'finance'] 
            }
          },
          required: ['title', 'content', 'category']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      id: `insight-${Date.now()}`,
      title: data.title || 'Sagesse Ephémère',
      content: data.content || 'Persévérez, car chaque petit pas est une victoire vers votre destin.',
      category: data.category || 'psychologie',
      read: false,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Gemini API Error (Growth Insight):", error);
    // Local fallback logic
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const fallbacks: { title: string, content: string, category: GrowthInsight['category'] }[] = [
      { title: 'La Règle des 2 Minutes', content: 'Si une tâche prend moins de deux minutes, agissez sur le champ pour libérer votre esprit.', category: 'productivité' },
      { title: 'Le Repos du Guerrier', content: 'Le sommeil est la source de votre mana. Visez 8 heures de repos total.', category: 'santé' },
      { title: 'Trésor de Patience', content: 'Épargnez une petite part de votre butin chaque mois pour forger votre avenir.', category: 'finance' }
    ];
    const item = fallbacks[dayOfYear % fallbacks.length];
    return { 
      id: `insight-fallback-${dayOfYear}`, 
      ...item, 
      read: false, 
      timestamp: Date.now() 
    };
  }
};
