import { apiClient } from "./apiClient";

export type Project = {
  projectId: string;
  projectName: string;
  userId: string;
};

export async function createProject(payload: {
  projectName: string;
  userId: string;
}): Promise<Project> {
  const { data } = await apiClient.post<Project>("/api/projects", payload);
  return data;
}

export async function getProject(projectId: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/api/projects/${projectId}`);
  return data;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data } = await apiClient.get<Project[]>(`/api/projects/user/${userId}`);
  return Array.isArray(data) ? data : [];
}
