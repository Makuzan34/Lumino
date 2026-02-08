
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from environment variables.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyWellnessTip = async (): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Donne-moi un conseil bien-être court (maximum 2 phrases) pour bien commencer ma journée en français.",
      config: {
        systemInstruction: "Tu es un coach bien-être expert. Sois motivant et concis.",
      }
    });
    // The .text property is a getter, do not call it as a function.
    return response.text || "Prenez une grande inspiration et souriez à la journée qui commence.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "L'équilibre est la clé d'une vie sereine.";
  }
};

export const suggestRoutine = async (goal: string): Promise<any[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggère une routine de 3 activités pour atteindre cet objectif : "${goal}". Réponds en français au format JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              activity: { type: Type.STRING },
              benefit: { type: Type.STRING },
              icon: { type: Type.STRING, description: "Un seul emoji représentatif" }
            },
            required: ["time", "activity", "benefit", "icon"]
          }
        }
      }
    });
    // The .text property is a getter, do not call it as a function.
    const jsonStr = (response.text || "[]").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
};
