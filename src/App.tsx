import "./App.css";
import { useState } from "react";
import { useCountdown } from "./hooks/useCountdown";
import { formatDuration } from "./lib/time";
import { WheelPicker } from "./components/WheelPicker";

function App() {
  const { status, remainingMs, durationMs, start, pause, resume, reset, adjust } =
    useCountdown();

  const [selection, setSelection] = useState<"20s" | "2m" | "custom">("20s");
  const [customMinutes, setCustomMinutes] = useState(1);
  const [customSeconds, setCustomSeconds] = useState(0);

  const customAmountMs = customMinutes * 60_000 + customSeconds * 1000;
  const adjustmentMs =
    selection === "20s" ? 20_000 : selection === "2m" ? 120_000 : customAmountMs;

  const handleAdjust = (direction: 1 | -1) => adjust(direction * adjustmentMs);

  const handleStartPauseResume = () => {
    if (status === "idle") start(5 * 60 * 1000);
    else if (status === "running") pause();
    else resume();
  };

  const primaryLabel =
    status === "idle" ? "Start" : status === "running" ? "Pause" : "Resume";

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">ClockWork</h1>
      </header>

      {/* Countdown display */}
      <section className="glass-card timer-card">
        <div className={status === "running" ? "timer-display running" : "timer-display"}>
          {formatDuration(remainingMs)}
        </div>
        <span className="timer-status">
          {status === "idle" && remainingMs === durationMs ? "Ready" : status === "running" ? "Counting down" : status === "paused" ? "Paused" : "Finished"}
        </span>
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

      {/* M3: presets (add / edit / delete) */}
      <section className="glass-card presets-card" />
    </main>
  );
}

export default App;
