import "dotenv/config";
import cors from "cors";
import express from "express";
import { listProjectFiles } from "./projectFiles.js";
import type { Message, ProjectSnapshot } from "./types.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const previewUrl = process.env.PROJECT_PREVIEW_URL ?? "http://localhost:5174";
const messageHistory: Message[] = [];

// update this prompt to be more efficient
const systemPrompt =
  "You are helping update the React project in the project folder.";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/project", async (_request, response) => {
  // you'll use this endpoint to show preview of your running react project , messages  , files , only one project for now is supported.
  // make sure the above state is synced with fe, even some changes are applied
  // return ProjectSnapshot type here

  try {
    const files = await listProjectFiles();

    console.log(files)
    const projectSnapshot: ProjectSnapshot = {
      summary: `React project snapshot with ${files.length} files.`,
      messageHistory,
      files,
      updatedAt: new Date().toISOString(),
      previewUrl,
    };

    console.log(projectSnapshot)
    response.json(projectSnapshot);
  } catch (error) {
    console.error("Failed to load project snapshot:", error);
    response.status(500).json({ error: "Failed to load project snapshot" });
  }
});

app.post("/api/messages", async (request, response) => {
  // read user message here and make changes to files present in projects folder in root dir
  // writeProjectFile(path, content). After writes, return a fresh project snapshot.
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
