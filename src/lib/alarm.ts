/**
 * Short completion alarm (~2.2 s) built entirely from the Web Audio API:
 * an alternating two-tone beep pattern. Creates a temporary AudioContext,
 * schedules every beep up front, and closes the context when done so no
 * audio resources leak. Meant to be called once per completed countdown.
 */
export function playCompletionAlarm(): void {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return;

  const ac = new Ctor();
  const t0 = ac.currentTime + 0.05;

  const master = ac.createGain();
  master.gain.value = 0.4;
  master.connect(ac.destination);

  // 8 short beeps over ~2.1 s, alternating pitch for an "alarm" feel.
  const BEEP_COUNT = 8;
  const BEEP_GAP = 0.26;
  for (let i = 0; i < BEEP_COUNT; i++) {
    const at = t0 + i * BEEP_GAP;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = i % 2 === 0 ? 880 : 660;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.9, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + 0.22);
  }

  // Release the AudioContext once the last beep has fully decayed.
  const totalMs = (BEEP_COUNT * BEEP_GAP + 0.3) * 1000;
  window.setTimeout(() => {
    void ac.close().catch(() => {
      // already closed - ignore
    });
  }, totalMs);
}
