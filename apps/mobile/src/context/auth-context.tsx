import type { IAuthUser } from '@koruz/types';
import type { ReactNode } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  user: IAuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: IAuthUser) => void;
  logout: () => void;
};

const defaultValue: AuthContextValue = {
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => undefined,
  logout: () => undefined,
};

export const AuthContext = createContext<AuthContextValue>(defaultValue);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('koruz_token');
    const storedUser = localStorage.getItem('koruz_user');
    if (!storedToken || !storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as IAuthUser;
      setToken(storedToken);
      setUser(parsedUser);
    } catch {
      localStorage.removeItem('koruz_token');
      localStorage.removeItem('koruz_user');
    }
  }, []);

  /**
   * Persists auth session and updates in-memory context.
   *
   * Args:
   *   nextToken (string): JWT token from backend.
   *   nextUser (IAuthUser): Authenticated user payload.
   *
   * Returns:
   *   void
   */
  const login = (nextToken: string, nextUser: IAuthUser): void => {
    localStorage.setItem('koruz_token', nextToken);
    localStorage.setItem('koruz_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  /**
   * Clears local auth session and resets context state.
   *
   * Returns:
   *   void
   */
  const logout = (): void => {
    localStorage.removeItem('koruz_token');
    localStorage.removeItem('koruz_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
