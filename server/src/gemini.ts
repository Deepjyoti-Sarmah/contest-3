import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FunctionCallingConfigMode, GoogleGenAI } from "@google/genai";
import { toolDefinitions } from "./tools.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDirectory, "../../.env") });

type GeminiContents = string | Array<Record<string, unknown>>;

export async function callGemini(contents: GeminiContents) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const result = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
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

  console.log(result.functionCalls);
  return result;
}

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Mock mode: GEMINI_API_KEY is not configured, so no files were changed.";
  }

  const result = await callGemini(prompt);

  return result.text ?? "";
}
