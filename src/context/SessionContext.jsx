import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { USE_MOCK_API } from '../api/config';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { useApiQuery } from '../hooks/useApiQuery';

const SessionContext = createContext(null);

/**
 * Holds the current user (from GET /auth/me) and the selected branch in React state only.
 * The session token stays in memory; the httpOnly fh_session cookie is sent automatically.
 */
export function SessionProvider({ children }) {
  const { data: user, loading, error, refetch, setData } = useApiQuery(() => authApi.me(), []);
  const [branchId, setBranchId] = useState('');

  const setUser = useCallback(
    (next) => {
      if (next?.token) {
        setAuthToken(next.token);
        setData(next.user ?? next);
        return;
      }
      setData(next);
    },
    [setData],
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* session may already be gone */
    } finally {
      setAuthToken(null);
      setData(null);
    }
  }, [setData]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken(null);
      setData(null);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [setData]);

  const can = useCallback(
    (permission) => {
      if (!permission) return true;
      const perms = user?.permissions;
      if (!perms) return true;
      return perms.includes('*') || perms.includes(permission);
    },
    [user],
  );

  const signedOut = !USE_MOCK_API && !user && error?.status === 401;
  const value = useMemo(
    () => ({
      user: signedOut ? null : user,
      loading: loading && !signedOut,
      error: signedOut ? null : error,
      refetch,
      setUser,
      signOut,
      can,
      branchId,
      setBranchId,
    }),
    [user, loading, error, signedOut, refetch, setUser, signOut, can, branchId],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

/** Renders children only if the API-provided permissions allow it. */
export function Can({ permission, children, fallback = null }) {
  const { can } = useSession();
  return can(permission) ? children : fallback;
}
