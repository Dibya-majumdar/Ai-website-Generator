import { apiClient } from "./apiClient";

export type ChatMessageDto = {
  messageId?: string;
  projectId?: string;
  userId?: string;
  role?: string;
  sender?: string;
  content?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
};

export async function saveMessage(payload: {
  projectId: string;
  userId: string;
  role: string;
  content: string;
}): Promise<ChatMessageDto> {
  const { data } = await apiClient.post<ChatMessageDto>("/api/messages", payload);
  return data;
}

export async function getMessage(messageId: string): Promise<ChatMessageDto> {
  const { data } = await apiClient.get<ChatMessageDto>(`/api/messages/${messageId}`);
  return data;
}

export async function getProjectMessages(projectId: string): Promise<ChatMessageDto[]> {
  const { data } = await apiClient.get<ChatMessageDto[]>(`/api/messages/project/${projectId}`);
  return Array.isArray(data) ? data : [];
}
