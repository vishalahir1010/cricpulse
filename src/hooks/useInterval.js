import { useEffect, useRef } from 'react';

/**
 * Runs `callback` every `delayMs`, pausing automatically while the tab is
 * in the background (document hidden) so we don't burn the free-tier
 * Cricket API quota polling a match nobody's looking at.
 * Pass `delayMs = null` to disable polling entirely (e.g. match already
 * completed, or the user is on a different tab of the UI).
 */
export function useInterval(callback, delayMs) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs == null) return undefined;

    let id = null;

    const tick = () => savedCallback.current();

    const start = () => {
      if (id == null) id = setInterval(tick, delayMs);
    };
    const stop = () => {
      if (id != null) {
        clearInterval(id);
        id = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start(); // catch up immediately on returning to the tab
        tick();
      }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [delayMs]);
}
