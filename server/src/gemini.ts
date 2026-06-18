import { FunctionCallingConfigMode, GoogleGenAI } from "@google/genai";
import { toolDefinitions } from "./tools.js";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

type GeminiContents = string | Array<Record<string, unknown>>;

export async function callGemini(contents: GeminiContents) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const result =  ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
          allowedFunctionNames: ["bash"],
        },
      },
      tools: [
        {
          functionDeclarations: toolDefinitions,
        },
      ],
    },
  });

  console.log(result)
}

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!apiKey) {
    return "Mock mode: GEMINI_API_KEY is not configured, so no files were changed.";
  }

  const result = await callGemini(prompt);

  return result.text ?? "";
}
