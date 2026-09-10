import "./App.css";

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">ClockWork</h1>
      </header>

      {/* M1: countdown display */}
      <section className="glass-card timer-card">
        <div className="timer-placeholder">00:00</div>
      </section>

      {/* M2: adjustment controls (wheel + minus/plus) */}
      <section className="glass-card controls-card" />

      {/* M3: presets (add / edit / delete) */}
      <section className="glass-card presets-card" />
    </main>
  );
}

export default App;
