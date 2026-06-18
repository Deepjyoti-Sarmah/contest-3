import { GoogleGenAI } from "@google/genai";


const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!apiKey) {
    return "Mock mode: GEMINI_API_KEY is not configured, so no files were changed.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const result = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return result.text ?? "";
}
