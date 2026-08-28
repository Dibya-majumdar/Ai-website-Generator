import { apiClient } from "./apiClient";
import type { ProjectFile } from "./projectFilesApi";

export type AiResponse = {
  files?: ProjectFile[];
  message?: string;
  operation?: string;
};

export async function askAi(payload: {
  prompt: string;
  userId: string;
  projectId: string;
}): Promise<AiResponse> {
  const { data } = await apiClient.post<AiResponse>("/api/ai/ask", payload);
  return data;
}
