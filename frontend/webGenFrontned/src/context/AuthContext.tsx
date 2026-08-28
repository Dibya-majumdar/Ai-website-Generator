import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { TOKEN_KEY, USER_ID_KEY, USERNAME_KEY, clearStoredAuth } from "@/api/apiClient";

type AuthState = {
  token: string | null;
  userId: string | null;
  username: string | null;
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  isReady: boolean;
  login: (session: { token: string; userId: string; username: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const emptyState: AuthState = { token: null, userId: null, username: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(emptyState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setState({
      token: window.localStorage.getItem(TOKEN_KEY),
      userId: window.localStorage.getItem(USER_ID_KEY),
      username: window.localStorage.getItem(USERNAME_KEY),
    });
    setIsReady(true);
  }, []);

  const login = useCallback((session: { token: string; userId: string; username: string }) => {
    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.localStorage.setItem(USER_ID_KEY, session.userId);
    window.localStorage.setItem(USERNAME_KEY, session.username);
    setState(session);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setState(emptyState);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token),
      isReady,
      login,
      logout,
    }),
    [state, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
