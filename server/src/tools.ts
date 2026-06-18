// put your tools here

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FunctionDeclaration } from "@google/genai";
import { listProjectFiles } from "./projectFiles.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const projectRoot = path.resolve(currentDirectory,
"../../project");

export const toolDefinitions: FunctionDeclaration[] = [
  {
    name: "bash",
    description: "List, read, or write files inside the project folder",
    parametersJsonSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["list", "read", "write"],
        },
        path: {
          type: "string",
          description: "Path relative to project/",
        },
        content: {
          type: "string",
          description: "Content to write into the file",
        },
      },
      required: ["action"],
    },
  },
];

function getSafeProjectPath(filePath: string) {
  const fullPath = path.resolve(projectRoot, filePath);

  if (!fullPath.startsWith(projectRoot)) {
    throw new Error("Path must stay inside project/");
  }

  return fullPath;
}

export async function runTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  if (name !== "bash") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const action = String(args.action ?? "");
  const filePath = String(args.path ?? "");
  const content = String(args.content ?? "");

  if (action === "list") {
    const files = await listProjectFiles();
    return JSON.stringify(files.map((file) => file.path),
null, 2);
  }

  if (action === "read") {
    const fullPath = getSafeProjectPath(filePath);
    return await readFile(fullPath, "utf8");
  }

  if (action === "write") {
    const fullPath = getSafeProjectPath(filePath);
    await writeFile(fullPath, content, "utf8");
    return `Wrote ${filePath}`;
  }

  throw new Error(`Unsupported action: ${action}`);
}
