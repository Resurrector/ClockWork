import "./App.css";
import { useEffect, useRef, useState } from "react";
import { useCountdown } from "./hooks/useCountdown";
import { formatDuration } from "./lib/time";
import { playCompletionAlarm } from "./lib/alarm";
import { WheelPicker } from "./components/WheelPicker";
import { PresetManager } from "./components/PresetManager";

const RING_RADIUS = 80;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function App() {
  const {
    status,
    remainingMs,
    durationMs,
    start,
    pause,
    resume,
    reset,
    adjust,
    load,
  } = useCountdown();

  const [selection, setSelection] = useState<"20s" | "2m" | "custom">("20s");
  const [customMinutes, setCustomMinutes] = useState(1);
  const [customSeconds, setCustomSeconds] = useState(0);

  const customAmountMs = customMinutes * 60_000 + customSeconds * 1000;
  const adjustmentMs =
    selection === "20s" ? 20_000 : selection === "2m" ? 120_000 : customAmountMs;

  const handleAdjust = (direction: 1 | -1) => adjust(direction * adjustmentMs);

  const handleStartPauseResume = () => {
    if (status === "idle" || status === "finished") start();
    else if (status === "running") pause();
    else resume();
  };

  const primaryLabel =
    status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start";

  const statusText =
    status === "running"
      ? "Counting down"
      : status === "paused"
        ? "Paused"
        : status === "finished"
          ? "Finished"
          : "Ready";

  /** 0 = full time left (empty ring), 1 = time fully elapsed (full ring). */
  const ringProgress =
    durationMs > 0
      ? Math.min(1, Math.max(0, 1 - remainingMs / durationMs))
      : 0;

  // Completion alarm: plays exactly once each time a countdown finishes.
  // The ref guard makes StrictMode's double effect invocation (dev) and
  // any later re-renders while status stays "finished" harmless.
  const alarmPlayedAtRef = useRef(0);
  useEffect(() => {
    if (status !== "finished") return;
    const now = Date.now();
    if (now - alarmPlayedAtRef.current < 10_000) return;
    alarmPlayedAtRef.current = now;
    playCompletionAlarm();
  }, [status]);

  // Keyboard shortcuts: Space = Start/Pause/Resume, R = Reset.
  // Skipped while typing or when focus sits on a control that owns the key
  // (buttons, inputs, the wheel picker).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, button, .wheel-rows"))
      ) {
        return;
      }
      if (e.code === "Space") {
        // Prevent the page from scrolling before anything else.
        e.preventDefault();
        if (!e.repeat) handleStartPauseResume();
      } else if (e.key === "r" || e.key === "R") {
        if (!e.repeat && status !== "idle") reset();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">ClockWork</h1>
      </header>

      {/* Countdown display with progress ring */}
      <section className="glass-card timer-card">
        <div
          className={
            status === "running"
              ? "timer-display running"
              : status === "finished"
                ? "timer-display finished"
                : "timer-display"
          }
        >
          <svg className="timer-ring" viewBox="0 0 180 180" aria-hidden="true">
            <circle className="timer-ring-track" cx="90" cy="90" r={RING_RADIUS} />
            <circle
              className="timer-ring-progress"
              cx="90"
              cy="90"
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * ringProgress}
            />
          </svg>
          <span className="timer-time">{formatDuration(remainingMs)}</span>
        </div>
        <span className="timer-status">{statusText}</span>
      </section>

      {/* Session controls */}
      <section className="session-controls">
        <button className="btn btn-secondary" onClick={reset} disabled={status === "idle"}>
          Reset
        </button>
        <button
          className={status === "running" ? "btn btn-primary running" : "btn btn-primary"}
          onClick={handleStartPauseResume}
        >
          {primaryLabel}
        </button>
      </section>

      {/* M2: adjustment controls (wheel + minus/plus) */}
      <section className="glass-card controls-card">
        <div className="adjust-row">
          <div className="segment" role="radiogroup" aria-label="Adjustment amount">
            <button
              className={selection === "20s" ? "segment-btn selected" : "segment-btn"}
              onClick={() => setSelection("20s")}
            >
              20 s
            </button>
            <button
              className={selection === "2m" ? "segment-btn selected" : "segment-btn"}
              onClick={() => setSelection("2m")}
            >
              2 min
            </button>
            <button
              className={selection === "custom" ? "segment-btn selected" : "segment-btn"}
              onClick={() => setSelection("custom")}
            >
              Custom
            </button>
          </div>
          <div className="adjust-buttons">
            <button className="btn-adjust" onClick={() => handleAdjust(-1)} aria-label="Subtract time">
              −
            </button>
            <button className="btn-adjust" onClick={() => handleAdjust(1)} aria-label="Add time">
              +
            </button>
          </div>
        </div>

        {selection === "custom" && (
          <WheelPicker
            minutes={customMinutes}
            seconds={customSeconds}
            onMinutesChange={setCustomMinutes}
            onSecondsChange={setCustomSeconds}
          />
        )}
      </section>

      {/* M3: presets (add / edit / delete / load) */}
      <PresetManager onLoad={load} />
    </main>
  );
}

export default App;
