import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSessionTimeout } from './useSessionTimeout';

describe('useSessionTimeout hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should call onTimeout when inactive for timeoutMs', () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimeout({ timeoutMs: 5000, onTimeout, isEnabled: true }));

    // Advance time by 4.9s - should not trigger yet
    act(() => {
      vi.advanceTimersByTime(4900);
    });
    expect(onTimeout).not.toHaveBeenCalled();

    // Advance the remaining time - should trigger
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('should not call onTimeout if disabled', () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimeout({ timeoutMs: 5000, onTimeout, isEnabled: false }));

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('should reset the timer when user activity events are dispatched', () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimeout({ timeoutMs: 5000, onTimeout, isEnabled: true }));

    // Advance time by 3s
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onTimeout).not.toHaveBeenCalled();

    // Simulate activity: dispatch mousemove event
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove'));
    });

    // Advance time by another 3s (total 6s from start, but 3s since activity)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onTimeout).not.toHaveBeenCalled();

    // Advance another 2s (reaches 5s since simulated activity) - should trigger
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
