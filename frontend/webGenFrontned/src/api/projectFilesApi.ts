import { apiClient } from "./apiClient";

export type ProjectFile = {
  projectFilesId?: string;
  projectId?: string;
  path: string;
  language: string;
  content: string;
};

export async function createProjectFile(payload: {
  projectId: string;
  path: string;
  language: string;
  content: string;
}): Promise<ProjectFile> {
  const { data } = await apiClient.post<ProjectFile>("/api/project-files", payload);
  return data;
}

export async function getProjectFile(projectFilesId: string): Promise<ProjectFile> {
  const { data } = await apiClient.get<ProjectFile>(`/api/project-files/${projectFilesId}`);
  return data;
}

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const { data } = await apiClient.get<ProjectFile[]>(`/api/project-files/project/${projectId}`);
  return Array.isArray(data) ? data : [];
}
