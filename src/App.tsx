import "./App.css";
import { useCountdown } from "./hooks/useCountdown";
import { formatDuration } from "./lib/time";

function App() {
  const { status, remainingMs, durationMs, start, pause, resume, reset } =
    useCountdown();

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
      <section className="glass-card controls-card" />

      {/* M3: presets (add / edit / delete) */}
      <section className="glass-card presets-card" />
    </main>
  );
}

export default App;
