import axios from "axios";

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // headers: { "Content-Type": "application/json" },
});

export const TOKEN_KEY = "token";
export const USER_ID_KEY = "userId";
export const USERNAME_KEY = "username";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_ID_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.set?.("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const isAuthCall = url.includes("/api/users/login") || url === "/api/users";
    if (status === 401 && !isAuthCall && typeof window !== "undefined") {
      clearStoredAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as unknown;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      for (const key of ["message", "error", "detail"]) {
        if (typeof record[key] === "string" && record[key]) return record[key] as string;
      }
    }
    if (error.code === "ERR_NETWORK") {
      return `Cannot reach the backend at ${API_BASE_URL}. Is your Spring Boot server running?`;
    }
    return error.message || fallback;
  }
  return fallback;
}
