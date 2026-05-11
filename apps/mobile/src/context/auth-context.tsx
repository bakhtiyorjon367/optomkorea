import type { IAuthUser } from '@koruz/types';
import type { ReactNode } from 'react';
import { createContext, useCallback, useMemo, useState } from 'react';

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

type StoredAuth = { token: string | null; user: IAuthUser | null };

/**
 * Reads persisted auth from localStorage synchronously so the very first
 * render already has the correct role. This avoids a transient render with
 * `user = null` followed by the real role, which causes Ionic's IonTabBar
 * to register the guest tabs and the role-specific tabs on different render
 * cycles — leading to colliding/stacked tab buttons after a hard reload.
 *
 * Returns:
 *   StoredAuth: token+user from storage, or { null, null } if missing/corrupt.
 */
function readPersistedAuth(): StoredAuth {
  if (typeof localStorage === 'undefined') {
    return { token: null, user: null };
  }
  const storedToken = localStorage.getItem('koruz_token');
  const storedUser = localStorage.getItem('koruz_user');
  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }
  try {
    const parsedUser = JSON.parse(storedUser) as IAuthUser;
    return { token: storedToken, user: parsedUser };
  } catch {
    localStorage.removeItem('koruz_token');
    localStorage.removeItem('koruz_user');
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [{ user, token }, setAuthState] = useState<StoredAuth>(readPersistedAuth);

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
  const login = useCallback((nextToken: string, nextUser: IAuthUser): void => {
    localStorage.setItem('koruz_token', nextToken);
    localStorage.setItem('koruz_user', JSON.stringify(nextUser));
    setAuthState({ token: nextToken, user: nextUser });
  }, []);

  /**
   * Clears local auth session and resets context state.
   *
   * Returns:
   *   void
   */
  const logout = useCallback((): void => {
    localStorage.removeItem('koruz_token');
    localStorage.removeItem('koruz_user');
    setAuthState({ token: null, user: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
