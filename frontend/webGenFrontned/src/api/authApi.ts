import { apiClient } from "./apiClient";

export type RegisterPayload = {
  username: string;
  emailId: string;
  password: string;
};

export type LoginPayload = {
  emailId: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: string;
  username: string;
};

export async function registerUser(payload: RegisterPayload) {
  const { data } = await apiClient.post("/api/users", payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/api/users/login", payload);
  return data;
}
