import { useCallback, useRef, useState } from 'react';

export function useAuthSubmission() {
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);

  const run = useCallback(async (task: () => Promise<void>) => {
    if (lock.current) {
      return;
    }

    lock.current = true;
    setSubmitting(true);
    try {
      await task();
    } finally {
      lock.current = false;
      setSubmitting(false);
    }
  }, []);

  return { submitting, run };
}
