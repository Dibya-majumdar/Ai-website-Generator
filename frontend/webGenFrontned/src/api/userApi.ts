import { apiClient } from "./apiClient";

export type AppUser = {
  userId?: string;
  id?: string;
  username?: string;
  emailId?: string;
};

export async function getUser(userId: string): Promise<AppUser> {
  const { data } = await apiClient.get<AppUser>(`/api/users/${userId}`);
  return data;
}
