import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "../types";

// Ensure API key is present
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    foodItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          weight: { type: Type.STRING },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
            }
          }
        }
      }
    },
    totalCalories: { type: Type.NUMBER },
    totalMacros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fats: { type: Type.NUMBER },
      }
    },
    healthRating: { type: Type.STRING, enum: ["Healthy", "Moderate", "Unhealthy"] },
    suggestions: { type: Type.STRING }
  }
};

export const analyzeFoodImage = async (base64Image: string, language: Language = 'ar'): Promise<Omit<AnalysisResult, 'id' | 'timestamp' | 'imageUrl' | 'mealType' | 'source'>> => {
  // Extract base64 data if it includes the prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
  
  const langName = language === 'ar' ? 'Arabic' : 'English';

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        },
        {
          text: `Analyze this food image. Identify the food items, estimate their weight, calories, and macronutrients (protein, carbs, fats). 
          Respond in ${langName}. 
          For 'healthRating', use EXACTLY one of these English values: "Healthy", "Moderate", "Unhealthy". 
          For all other text fields (name, suggestions), use ${langName}.
          Provide a total summary and a health rating.
          Also give a short suggestion for a healthier alternative or improvement.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to parse analysis results");
  }
};

export const analyzeFoodText = async (description: string, language: Language = 'ar'): Promise<Omit<AnalysisResult, 'id' | 'timestamp' | 'imageUrl' | 'mealType' | 'source'>> => {
  const langName = language === 'ar' ? 'Arabic' : 'English';

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          text: `Analyze this food description: "${description}". 
          Identify the food items based on the text, estimate standard weight, calories, and macronutrients.
          Respond in ${langName}.
          For 'healthRating', use EXACTLY one of these English values: "Healthy", "Moderate", "Unhealthy".
          Provide a total summary.
          Also give a short suggestion.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to parse analysis results");
  }
};
