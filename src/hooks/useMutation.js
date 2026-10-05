import { useCallback, useState } from 'react';

/** Wraps a write call: { mutate, loading, error, reset }. `mutate` rethrows so callers can react. */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        return await mutationFn(...args);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn],
  );

  return { mutate, loading, error, reset: () => setError(null) };
}
