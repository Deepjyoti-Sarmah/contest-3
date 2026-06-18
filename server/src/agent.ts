import { callGemini } from "./gemini.js";
import { runTool } from "./tools.js";

type AgentMessage = {
  role: "user" | "model";
  parts: Array<Record<string, unknown>>;
};

export async function runAgent(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Mock mode: GEMINI_API_KEY is not configured, so no files were changed.";
  }

  const contents: AgentMessage[] = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  for (let i = 0; i < 5; i++) {
    const response = await callGemini(contents);

    const functionCalls = response.functionCalls ?? [];

    console.log(response.functionCalls)

    if (functionCalls.length === 0) {
      return response.text ?? "";
    }

    contents.push({
      role: "model",
      parts: functionCalls.map((call) => ({
        functionCall: {
          name: call.name,
          args: call.args,
        },
      })),
    });

    const toolResponseParts = await Promise.all(
      functionCalls.map(async (call) => {
        const result = await runTool(
          call.name ?? "",
          (call.args as Record<string, unknown>) ?? {},
        );

        return {
          functionResponse: {
            name: call.name,
            response: { result },
          },
        };
      }),
    );

    contents.push({
      role: "user",
      parts: toolResponseParts,
    });
  }

  return "Stopped after too many tool calls.";
}
