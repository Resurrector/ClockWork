import { useCallback, useEffect, useRef, useState } from "react";

export type CountdownStatus = "idle" | "running" | "paused";

const TICK_INTERVAL_MS = 250;
export const MAX_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Timestamp-based countdown. Elapsed time is derived from wall-clock
 * `endsAt` (or `remainingMs` while paused) rather than by accumulating
 * interval ticks, so it stays accurate even if timers are throttled
 * and simple adjustments just move `endsAt` later (M2).
 */
export function useCountdown(initialDurationMs = 5 * 60 * 1000) {
  const [status, setStatus] = useState<CountdownStatus>("idle");
  const [durationMs, setDurationMs] = useState(initialDurationMs);
  const [remainingMs, setRemainingMs] = useState(initialDurationMs);
  const endsAtRef = useRef<number | null>(null);
  const statusRef = useRef<CountdownStatus>("idle");
  const remainingRef = useRef(initialDurationMs);

  statusRef.current = status;
  remainingRef.current = remainingMs;

  const start = useCallback((ms: number) => {
    const clamped = Math.max(0, ms);
    setDurationMs(clamped);
    setRemainingMs(clamped);
    endsAtRef.current = Date.now() + clamped;
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current !== "running" || endsAtRef.current === null) return;
    const remaining = Math.max(0, endsAtRef.current - Date.now());
    endsAtRef.current = null;
    remainingRef.current = remaining;
    setRemainingMs(remaining);
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return;
    endsAtRef.current = Date.now() + remainingRef.current;
    setStatus("running");
  }, []);

  const reset = useCallback(() => {
    endsAtRef.current = null;
    setStatus("idle");
    setRemainingMs(durationMs);
  }, [durationMs]);

  /**
   * Shifts the remaining time by `deltaMs` without pausing. While
   * running this just moves `endsAt`; while paused/idle it changes
   * the stored remaining time. Clamps to [0, MAX_DURATION_MS]; hitting
   * zero finishes the session.
   */
  const adjust = useCallback((deltaMs: number) => {
    if (statusRef.current === "running" && endsAtRef.current !== null) {
      const newRemaining = endsAtRef.current - Date.now() + deltaMs;
      if (newRemaining <= 0) {
        endsAtRef.current = null;
        remainingRef.current = 0;
        setRemainingMs(0);
        setStatus("idle");
        return;
      }
      const clamped = Math.min(newRemaining, MAX_DURATION_MS);
      endsAtRef.current = Date.now() + clamped;
      remainingRef.current = clamped;
      setRemainingMs(clamped);
      return;
    }

    // idle or paused: adjust the stored remaining time
    const newRemaining = Math.min(
      Math.max(0, remainingRef.current + deltaMs),
      MAX_DURATION_MS,
    );
    remainingRef.current = newRemaining;
    setRemainingMs(newRemaining);
    if (newRemaining === 0) {
      endsAtRef.current = null;
      setStatus("idle");
    } else if (statusRef.current === "idle") {
      // never started (or finished): keep reset() consistent
      setDurationMs(newRemaining);
    }
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => {
      if (endsAtRef.current === null) return;
      const remaining = Math.max(0, endsAtRef.current - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) {
        endsAtRef.current = null;
        setStatus("idle");
      }
    };
    const interval = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status]);

  return { status, remainingMs, durationMs, start, pause, resume, reset, adjust };
}