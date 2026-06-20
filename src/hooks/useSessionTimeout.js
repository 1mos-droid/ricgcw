import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect user inactivity and trigger a callback.
 * @param {Object} params
 * @param {number} params.timeoutMs - Timeout threshold in milliseconds
 * @param {Function} params.onTimeout - Callback triggered when timeout is reached
 * @param {boolean} params.isEnabled - Flag to enable or disable the timeout monitoring
 */
export const useSessionTimeout = ({ timeoutMs, onTimeout, isEnabled }) => {
  const timeoutRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);

  // Keep callback reference updated
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!isEnabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onTimeoutRef.current();
      }, timeoutMs);
    };

    // Initialize timer
    resetTimer();

    // Listen to standard user interaction events
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMs, isEnabled]);
};
