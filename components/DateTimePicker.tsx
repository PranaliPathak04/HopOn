"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

// ── Date Picker ──────────────────────────────────────────────────────────────

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  minDate?: string; // "YYYY-MM-DD"
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DatePicker({ value, onChange, minDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const base = value ? new Date(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const minDateObj = minDate ? new Date(minDate) : null;
  if (minDateObj) minDateObj.setHours(0, 0, 0, 0);

  const todayStr = toDateStr(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: {
    day: number;
    inMonth: boolean;
    dateStr: string;
    disabled: boolean;
  }[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(year, month - 1, day);
    cells.push({ day, inMonth: false, dateStr: toDateStr(d), disabled: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const disabled = minDateObj ? d < minDateObj : false;
    cells.push({ day, inMonth: true, dateStr: toDateStr(d), disabled });
  }
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(year, month + 1, day);
    cells.push({ day, inMonth: false, dateStr: toDateStr(d), disabled: true });
  }

  function selectDay(dateStr: string, disabled: boolean) {
    if (disabled) return;
    onChange(dateStr);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`dt-field ${open ? "dt-field--open" : ""}`}
      >
        <Calendar size={15} className="dt-field-icon" />
        <span className={value ? "dt-field-value" : "dt-field-placeholder"}>
          {value ? formatDisplay(value) : "Select date"}
        </span>
      </button>

      {open && (
        <div className="dt-panel dt-calendar">
          {/* Month nav */}
          <div className="dt-cal-header">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="dt-cal-nav"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="dt-cal-title">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="dt-cal-nav"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day labels */}
          <div className="dt-cal-weekdays">
            {DAY_LABELS.map((d) => (
              <div key={d} className="dt-cal-weekday">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="dt-cal-grid">
            {cells.map((cell, i) => {
              const isSelected = cell.dateStr === value;
              const isToday = cell.dateStr === todayStr;
              const classes = [
                "dt-cal-day",
                !cell.inMonth && "dt-cal-day--outside",
                cell.disabled && "dt-cal-day--disabled",
                isToday && !isSelected && "dt-cal-day--today",
                isSelected && "dt-cal-day--selected",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={i}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => selectDay(cell.dateStr, cell.disabled)}
                  className={classes}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const disabled = minDateObj ? today < minDateObj : false;
              selectDay(todayStr, disabled);
            }}
            className="dt-cal-today-btn"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}

// ── Time Picker (analog clock) ───────────────────────────────────────────────

interface TimePickerProps {
  value: string; // "HH:mm" (24hr)
  onChange: (value: string) => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTimeDisplay(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

// Position of clock index i (0..11) around the dial. i=0 sits at the top.
function pointFor(i: number, r: number) {
  const angle = ((i * 30 - 90) * Math.PI) / 180;
  return { x: 130 + r * Math.cos(angle), y: 130 + r * Math.sin(angle) };
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const containerRef = useRef<HTMLDivElement>(null);

  const [hhStr, mmStr] = value ? value.split(":") : ["09", "00"];
  const hh24 = Number(hhStr) || 0;
  const mm = Number(mmStr) || 0;
  const period: "AM" | "PM" = hh24 >= 12 ? "PM" : "AM";
  const hour12 = hh24 % 12 === 0 ? 12 : hh24 % 12;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openPanel() {
    setMode("hour");
    setOpen(true);
  }

  function setPeriod(next: "AM" | "PM") {
    if (next === period) return;
    // AM <-> PM is always a swap of 12 hours, in either direction.
    const newHour24 = (hh24 + 12) % 24;
    onChange(`${pad(newHour24)}:${pad(mm)}`);
  }

  function selectHour(displayHour: number) {
    let newHour24 = displayHour % 12; // 12 -> 0
    if (period === "PM") newHour24 += 12;
    onChange(`${pad(newHour24)}:${pad(mm)}`);
    setMode("minute");
  }

  function selectMinute(minute: number) {
    onChange(`${pad(hh24)}:${pad(minute)}`);
    setOpen(false);
  }

  const dialNumbers = Array.from({ length: 12 }, (_, i) =>
    mode === "hour" ? (i === 0 ? 12 : i) : i * 5,
  );
  const selectedIndex = mode === "hour" ? (hour12 === 12 ? 0 : hour12) : mm / 5;
  const handPoint = pointFor(selectedIndex, 98);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={`dt-field ${open ? "dt-field--open" : ""}`}
      >
        <Clock size={15} className="dt-field-icon" />
        <span className={value ? "dt-field-value" : "dt-field-placeholder"}>
          {value ? formatTimeDisplay(value) : "Select time"}
        </span>
      </button>

      {open && (
        <div className="dt-panel dt-clock">
          <div className="dt-clock-header">
            <div className="dt-clock-time">
              <button
                type="button"
                onClick={() => setMode("hour")}
                className={`dt-clock-time-part ${mode === "hour" ? "dt-clock-time-part--active" : ""}`}
              >
                {pad(hour12)}
              </button>
              <span className="dt-clock-time-sep">:</span>
              <button
                type="button"
                onClick={() => setMode("minute")}
                className={`dt-clock-time-part ${mode === "minute" ? "dt-clock-time-part--active" : ""}`}
              >
                {pad(mm)}
              </button>
            </div>
            <div className="dt-clock-ampm">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={`dt-clock-ampm-btn ${period === "AM" ? "dt-clock-ampm-btn--active" : ""}`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={`dt-clock-ampm-btn ${period === "PM" ? "dt-clock-ampm-btn--active" : ""}`}
              >
                PM
              </button>
            </div>
          </div>

          <svg viewBox="0 0 260 260" className="dt-clock-face">
            <circle cx={130} cy={130} r={118} className="dt-clock-face-bg" />
            <line
              x1={130}
              y1={130}
              x2={handPoint.x}
              y2={handPoint.y}
              className="dt-clock-hand"
            />
            <circle cx={130} cy={130} r={4} className="dt-clock-center" />

            {dialNumbers.map((n, i) => {
              const { x, y } = pointFor(i, 98);
              const selected = i === selectedIndex;
              return (
                <g
                  key={n}
                  className="dt-clock-number-group"
                  onClick={() =>
                    mode === "hour" ? selectHour(n) : selectMinute(n)
                  }
                >
                  {selected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={17}
                      className="dt-clock-selected-dot"
                    />
                  )}
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className={`dt-clock-number ${selected ? "dt-clock-number--selected" : ""}`}
                  >
                    {mode === "minute" ? pad(n) : n}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
