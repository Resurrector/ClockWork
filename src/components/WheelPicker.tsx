import { useEffect, useRef } from "react";

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;
const SNAP_DELAY_MS = 90;

interface WheelColumnProps {
  values: string[];
  index: number;
  onChange: (index: number) => void;
  label: string;
}

/** One scroll-snap column of a phone-style time picker. */
function WheelColumn({ values, index, onChange, label }: WheelColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const snapTimer = useRef<number | undefined>(undefined);
  const animatingRef = useRef(false);

  // Scroll to the selected index when it changes from outside.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = index * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) < 1) return;
    animatingRef.current = true;
    el.scrollTo({ top: target, behavior: "smooth" });
    window.setTimeout(() => {
      animatingRef.current = false;
    }, 250);
  }, [index]);

  // Initialize scroll position without animation.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = index * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (animatingRef.current) return;
    window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const next = Math.min(
        values.length - 1,
        Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT)),
      );
      if (next !== index) onChange(next);
    }, SNAP_DELAY_MS);
  };

  return (
    <div className="wheel-column">
      <span className="wheel-label">{label}</span>
      <div
        ref={scrollRef}
        className="wheel-scroll"
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
        onScroll={handleScroll}
      >
        <div style={{ height: ITEM_HEIGHT }} />
        {values.map((value, i) => (
          <div
            key={value}
            className={i === index ? "wheel-item selected" : "wheel-item"}
            style={{ height: ITEM_HEIGHT }}
            onClick={() => onChange(i)}
          >
            {value}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT }} />
      </div>
    </div>
  );
}

interface WheelPickerProps {
  minutes: number;
  seconds: number;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
}

/** Compact two-column (minutes / seconds) spinning picker. */
export function WheelPicker({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
}: WheelPickerProps) {
  const range = (count: number) =>
    Array.from({ length: count }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="wheel-picker">
      <WheelColumn
        label="min"
        values={range(60)}
        index={minutes}
        onChange={onMinutesChange}
      />
      <div className="wheel-separator">:</div>
      <WheelColumn
        label="sec"
        values={range(60)}
        index={seconds}
        onChange={onSecondsChange}
      />
    </div>
  );
}