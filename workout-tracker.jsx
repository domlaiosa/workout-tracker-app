import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, Plus, Check, Flame, Dumbbell, Clock, Settings as SettingsIcon,
  Home as HomeIcon, History as HistoryIcon, X, Trash2, ChevronRight,
  Calendar, Timer, LogOut, Pencil, RotateCcw,
} from "lucide-react";

/* ----------------------------- design tokens ----------------------------- */
const T = {
  bg: "#121519",
  surface: "#1A1F25",
  surface2: "#232A31",
  line: "#2B333B",
  text: "#ECE9E1",
  muted: "#8B949E",
  faint: "#5C656E",
  accent: "#FFB323",
  accentDim: "rgba(255,179,35,0.12)",
  good: "#5BD583",
  danger: "#F2545B",
  display: "'Oswald', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
@keyframes pop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes slideup { 0%{transform:translateY(14px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
input::placeholder { color:${T.faint} }
input:focus { outline:none }
::-webkit-scrollbar{ width:0; height:0 }
`;

/* ------------------------------- mock data -------------------------------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const LETTERS = "ABCDEFGHIJ".split("");

const seedSets = (arr) => arr.map(([w, r]) => ({ id: uid(), weight: w, reps: r, done: true }));

const HISTORY_SEED = [
  {
    id: uid(),
    name: "Monday · Back",
    date: daysAgo(0),
    bodyParts: ["Back", "Biceps"],
    durationSec: 68 * 60,
    exercises: [
      { id: uid(), name: "Weighted pull up", tempo: "", restSec: 60, notes: "last one was a fight", sets: seedSets([[25, 10], [35, 10], [45, 5], [45, 5]]) },
      { id: uid(), name: "Rack pulls", tempo: "", restSec: 120, notes: "", sets: seedSets([[135, 10], [165, 10], [185, 10], [195, 10], [195, 10]]) },
      { id: uid(), name: "Lat pulldown", tempo: "3:0:0", restSec: 60, notes: "sneaky too heavy", sets: seedSets([[115, 10], [130, 10], [145, 10], [145, 10]]) },
      { id: uid(), name: "Single arm row", tempo: "0:3:0", restSec: 60, notes: "", sets: seedSets([[50, 12], [50, 12], [50, 12], [50, 12], [50, 12]]) },
      { id: uid(), name: "Hammer curl", tempo: "", restSec: 30, notes: "", sets: seedSets([[35, 6], [35, 6], [35, 6], [35, 6]]) },
    ],
  },
  { id: uid(), name: "Saturday · Push", date: daysAgo(2), bodyParts: ["Chest", "Shoulders"], durationSec: 55 * 60,
    exercises: [{ id: uid(), name: "Bench press", tempo: "2:0:1", restSec: 120, notes: "", sets: seedSets([[135, 8], [155, 6], [155, 6]]) }] },
  { id: uid(), name: "Thursday · Legs", date: daysAgo(3), bodyParts: ["Quads", "Hamstrings"], durationSec: 72 * 60,
    exercises: [{ id: uid(), name: "Back squat", tempo: "3:0:0", restSec: 180, notes: "felt strong", sets: seedSets([[185, 5], [205, 5], [225, 5]]) }] },
  { id: uid(), name: "Wednesday · Pull", date: daysAgo(4), bodyParts: ["Back"], durationSec: 60 * 60,
    exercises: [{ id: uid(), name: "Deadlift", tempo: "", restSec: 180, notes: "", sets: seedSets([[225, 5], [275, 3], [315, 1]]) }] },
];

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(7, 30, 0, 0); return d.getTime(); }
function fmtClock(s) { const m = Math.floor(s / 60), sec = s % 60; return `${m}:${String(sec).padStart(2, "0")}`; }
function fmtDur(s) { const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h ? `${h}h ${m}m` : `${m}m`; }
function relDay(ts) {
  const diff = Math.floor((Date.now() - ts) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
const BODY_PARTS = ["Back", "Chest", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Glutes", "Cardio"];

/* -------------------------------- helpers --------------------------------- */
const totalVolume = (w) => w.exercises.reduce((a, e) => a + e.sets.reduce((s, x) => s + (x.weight * x.reps || 0), 0), 0);
const totalSets = (w) => w.exercises.reduce((a, e) => a + e.sets.length, 0);

function computeStreak(history) {
  const days = new Set(history.map((w) => { const d = new Date(w.date); d.setHours(0, 0, 0, 0); return d.getTime(); }));
  let streak = 0; const cur = new Date(); cur.setHours(0, 0, 0, 0);
  // allow today OR yesterday to start the streak
  if (!days.has(cur.getTime())) cur.setDate(cur.getDate() - 1);
  while (days.has(cur.getTime())) { streak++; cur.setDate(cur.getDate() - 1); }
  return streak;
}

/* ================================== APP =================================== */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [history, setHistory] = useState(HISTORY_SEED);
  const [active, setActive] = useState(null);            // workout in progress
  const [openEx, setOpenEx] = useState(null);            // exercise id open in detail
  const [units, setUnits] = useState("lb");
  const [draft, setDraft] = useState({ name: "", parts: [] });

  // live workout clock
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const streak = computeStreak(history);
  const weekCount = history.filter((w) => Date.now() - w.date < 7 * 86400000).length;
  const weekVolume = history.filter((w) => Date.now() - w.date < 7 * 86400000).reduce((a, w) => a + totalVolume(w), 0);

  /* --- actions --- */
  function beginSetup() {
    setDraft({ name: "", parts: [] });
    setScreen("setup");
  }
  function startWorkout() {
    const day = new Date().toLocaleDateString(undefined, { weekday: "long" });
    const fallback = draft.parts.length ? `${day} · ${draft.parts.join(" / ")}` : `${day} workout`;
    setActive({ id: uid(), name: draft.name.trim() || fallback, date: Date.now(), bodyParts: draft.parts, exercises: [] });
    setElapsed(0);
    setScreen("active");
  }
  function addExercise(name) {
    const ex = { id: uid(), name, tempo: "", restSec: 60, notes: "", sets: [{ id: uid(), weight: "", reps: "", done: false }] };
    setActive((a) => ({ ...a, exercises: [...a.exercises, ex] }));
    setOpenEx(ex.id);
    setScreen("exercise");
  }
  function updateEx(exId, patch) {
    setActive((a) => ({ ...a, exercises: a.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) }));
  }
  function removeEx(exId) {
    setActive((a) => ({ ...a, exercises: a.exercises.filter((e) => e.id !== exId) }));
  }
  function finishWorkout() {
    const cleaned = { ...active, durationSec: elapsed,
      exercises: active.exercises.map((e) => ({ ...e, sets: e.sets.filter((s) => s.weight !== "" || s.reps !== "") })) };
    setHistory((h) => [cleaned, ...h]);
    setActive(null); setOpenEx(null); setScreen("home");
  }

  const shell = {
    fontFamily: T.body, background: T.bg, color: T.text, width: "100%", maxWidth: 430,
    margin: "0 auto", minHeight: 760, position: "relative", overflow: "hidden",
    border: `1px solid ${T.line}`, borderRadius: 28, boxShadow: "0 30px 80px rgba(0,0,0,.45)",
  };

  return (
    <div style={{ background: "#0B0D10", padding: "24px 12px", display: "flex", justifyContent: "center", minHeight: "100vh" }}>
      <style>{FONTS}</style>
      <div style={shell}>
        {screen === "home" && <Home {...{ streak, weekCount, weekVolume, history, units, onStart: beginSetup, onGoSettings: () => setScreen("settings"), onGoHistory: () => setScreen("history"), onOpen: (w) => { setActive({ ...w, _readonly: true }); setScreen("active"); } }} />}
        {screen === "history" && <HistoryList {...{ history, units, onBack: () => setScreen("home"), onOpen: (w) => { setActive({ ...w, _readonly: true }); setScreen("active"); }, onStart: beginSetup, onGoSettings: () => setScreen("settings") }} />}
        {screen === "setup" && <Setup {...{ draft, setDraft, onBack: () => setScreen("home"), onStart: startWorkout }} />}
        {screen === "active" && active && <Active {...{ active, elapsed, units, onBack: () => { if (active._readonly) { setActive(null); setScreen("home"); } else setScreen("active"); }, onClose: () => { setActive(null); setScreen("home"); }, onAddExercise: () => setScreen("pickExercise"), onOpenEx: (id) => { setOpenEx(id); setScreen("exercise"); }, onFinish: finishWorkout, onRemoveEx: removeEx }} />}
        {screen === "pickExercise" && <PickExercise {...{ onBack: () => setScreen("active"), onPick: addExercise }} />}
        {screen === "exercise" && active && (() => {
          const idx = active.exercises.findIndex((e) => e.id === openEx);
          const total = active.exercises.length;
          const goTo = (i) => setOpenEx(active.exercises[i].id);
          return <ExerciseDetail
            ex={active.exercises[idx]} index={idx} total={total}
            readonly={active._readonly} units={units}
            onBack={() => setScreen("active")}
            onUpdate={(patch) => updateEx(openEx, patch)}
            onPrev={idx > 0 ? () => goTo(idx - 1) : null}
            onNext={idx < total - 1 ? () => goTo(idx + 1) : null}
            onAddExercise={() => setScreen("pickExercise")}
            onFinish={finishWorkout}
          />;
        })()}
        {screen === "settings" && <Settings {...{ units, setUnits, onBack: () => setScreen("home"), streak, count: history.length }} />}
      </div>
    </div>
  );
}

/* -------------------------------- shared UI ------------------------------- */
function TopBar({ title, onBack, right, eyebrow }) {
  return (
    <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.line}` }}>
      {onBack && (
        <button onClick={onBack} style={iconBtn}><ChevronLeft size={22} color={T.text} /></button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.accent, textTransform: "uppercase" }}>{eyebrow}</div>}
        <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 24, lineHeight: 1.05, letterSpacing: .3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

const iconBtn = { background: "transparent", border: "none", padding: 4, cursor: "pointer", display: "flex", alignItems: "center", marginLeft: -4 };

function Letter({ i, active }) {
  return (
    <div style={{
      width: 34, height: 34, flexShrink: 0, display: "grid", placeItems: "center",
      fontFamily: T.display, fontWeight: 700, fontSize: 18, borderRadius: 9,
      background: active ? T.accent : T.surface2, color: active ? "#1A1206" : T.muted,
      border: `1px solid ${active ? T.accent : T.line}`,
    }}>{LETTERS[i]}</div>
  );
}

function BottomNav({ tab, onHome, onHistory, onSettings }) {
  const item = (key, Icon, label, fn) => (
    <button onClick={fn} style={{ background: "transparent", border: "none", cursor: "pointer", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0" }}>
      <Icon size={21} color={tab === key ? T.accent : T.faint} />
      <span style={{ fontSize: 10, fontWeight: 600, color: tab === key ? T.accent : T.faint }}>{label}</span>
    </button>
  );
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", background: "rgba(18,21,25,.94)", backdropFilter: "blur(8px)", borderTop: `1px solid ${T.line}`, padding: "6px 8px 10px" }}>
      {item("home", HomeIcon, "Home", onHome)}
      {item("history", HistoryIcon, "History", onHistory)}
      {item("settings", SettingsIcon, "Settings", onSettings)}
    </div>
  );
}

/* ---------------------------------- HOME ---------------------------------- */
function Home({ streak, weekCount, weekVolume, history, units, onStart, onGoSettings, onGoHistory, onOpen }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: "26px 20px 8px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.muted, textTransform: "uppercase" }}>{greet}</div>
        <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 30, letterSpacing: .4 }}>Ready to train.</div>
      </div>

      {/* streak hero */}
      <div style={{ margin: "12px 16px", padding: "20px 22px", borderRadius: 20, background: `linear-gradient(135deg, ${T.surface2}, ${T.surface})`, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
          <Flame size={52} color={T.accent} strokeWidth={1.6} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 46, lineHeight: .9, color: T.accent }}>{streak}</span>
            <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 18, color: T.text }}>day{streak === 1 ? "" : "s"}</span>
          </div>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
            {streak > 0 ? "On a streak — keep it lit." : "Train today to start a streak."}
          </div>
        </div>
      </div>

      {/* week stats */}
      <div style={{ display: "flex", gap: 12, margin: "0 16px 6px" }}>
        <Stat label="This week" value={weekCount} unit={`workout${weekCount === 1 ? "" : "s"}`} />
        <Stat label="Volume" value={Math.round(weekVolume / 1000 * 10) / 10 + "k"} unit={units} />
      </div>

      {/* start workout button */}
      <div style={{ padding: "14px 16px 4px" }}>
        <button onClick={onStart} style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: "pointer", background: T.accent, color: "#1A1206", fontFamily: T.display, fontWeight: 700, fontSize: 18, letterSpacing: .5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(255,179,35,.25)" }}>
          <Plus size={22} strokeWidth={2.6} /> START WORKOUT
        </button>
      </div>

      {/* recent */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 8px" }}>
        <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 18, letterSpacing: .3 }}>Recent</div>
        <button onClick={onGoHistory} style={{ background: "none", border: "none", color: T.accent, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>See all</button>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {history.slice(0, 4).map((w) => <WorkoutCard key={w.id} w={w} units={units} onClick={() => onOpen(w)} />)}
      </div>

      <BottomNav tab="home" onHome={() => {}} onHistory={onGoHistory} onSettings={onGoSettings} />
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div style={{ flex: 1, padding: "14px 16px", borderRadius: 16, background: T.surface, border: `1px solid ${T.line}` }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 4 }}>
        <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 28, color: T.text }}>{value}</span>
        <span style={{ fontSize: 11, color: T.faint, fontWeight: 600 }}>{unit}</span>
      </div>
    </div>
  );
}

function WorkoutCard({ w, units, onClick }) {
  return (
    <button onClick={onClick} style={{ textAlign: "left", cursor: "pointer", width: "100%", padding: "14px 16px", borderRadius: 16, background: T.surface, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 17, letterSpacing: .2 }}>{w.name}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 11.5, color: T.muted, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Calendar size={12} />{relDay(w.date)}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Dumbbell size={12} />{w.exercises.length} ex</span>
          {w.durationSec != null && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={12} />{fmtDur(w.durationSec)}</span>}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18, color: T.accent }}>{(totalVolume(w) / 1000).toFixed(1)}k</div>
        <div style={{ fontSize: 10, color: T.faint }}>{units} vol</div>
      </div>
      <ChevronRight size={18} color={T.faint} />
    </button>
  );
}

function FabBar({ onStart }) {
  return (
    <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, padding: "10px 16px 4px", display: "flex", justifyContent: "center" }}>
      <button onClick={onStart} style={{ width: "100%", maxWidth: 398, padding: "16px", borderRadius: 16, border: "none", cursor: "pointer", background: T.accent, color: "#1A1206", fontFamily: T.display, fontWeight: 700, fontSize: 18, letterSpacing: .5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(255,179,35,.25)" }}>
        <Plus size={22} strokeWidth={2.6} /> START WORKOUT
      </button>
    </div>
  );
}

/* -------------------------------- HISTORY --------------------------------- */
function HistoryList({ history, units, onBack, onOpen, onStart, onGoSettings }) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="History" onBack={onBack} eyebrow={`${history.length} sessions`} />
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {history.map((w) => <WorkoutCard key={w.id} w={w} units={units} onClick={() => onOpen(w)} />)}
      </div>
      <BottomNav tab="history" onHome={onBack} onHistory={() => {}} onSettings={onGoSettings} />
    </div>
  );
}

/* --------------------------------- SETUP ---------------------------------- */
function Setup({ draft, setDraft, onBack, onStart }) {
  const toggle = (p) => setDraft((d) => ({ ...d, parts: d.parts.includes(p) ? d.parts.filter((x) => x !== p) : [...d.parts, p] }));
  const now = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
  const dateStr = now.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  const ready = draft.parts.length > 0;
  const cap = { fontFamily: T.mono, fontSize: 11, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" };
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 760 }}>
      <TopBar title="New workout" onBack={onBack} eyebrow="Set it up" />
      <div style={{ padding: "22px 20px", flex: 1 }}>
        {/* date / day header */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 34, letterSpacing: .3, lineHeight: 1 }}>{dayName}</div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.accent, marginTop: 6, letterSpacing: .5 }}>{dateStr}</div>
        </div>

        {/* name (optional) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={cap}>Name</span>
          <span style={{ fontSize: 11, color: T.faint, fontWeight: 500 }}>optional</span>
        </div>
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="e.g. Push day, Upper A…"
          style={{ width: "100%", marginTop: 8, padding: "14px 16px", borderRadius: 14, background: T.surface, border: `1px solid ${T.line}`, color: T.text, fontFamily: T.display, fontSize: 20, fontWeight: 500 }}
        />

        {/* target (required) */}
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 7 }}>
          <span style={cap}>Target</span>
          <span style={{ color: T.accent, fontSize: 14, lineHeight: 1, marginTop: -1 }}>★</span>
          <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>required</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 }}>
          {BODY_PARTS.map((p) => {
            const on = draft.parts.includes(p);
            return (
              <button key={p} onClick={() => toggle(p)} style={{
                padding: "9px 15px", borderRadius: 999, cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                fontFamily: T.body, background: on ? T.accentDim : T.surface,
                border: `1px solid ${on ? T.accent : T.line}`, color: on ? T.accent : T.muted,
              }}>{p}</button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "0 20px 26px" }}>
        <button onClick={onStart} disabled={!ready} style={{ width: "100%", padding: 16, borderRadius: 16, border: "none", cursor: ready ? "pointer" : "default", opacity: ready ? 1 : .4, background: T.accent, color: "#1A1206", fontFamily: T.display, fontWeight: 700, fontSize: 18, letterSpacing: .5 }}>
          {ready ? "BEGIN" : "SELECT A TARGET"}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- ACTIVE --------------------------------- */
function Active({ active, elapsed, units, onBack, onClose, onAddExercise, onOpenEx, onFinish, onRemoveEx }) {
  const ro = active._readonly;
  const dur = ro ? active.durationSec : elapsed;
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 760 }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onClose} style={iconBtn}><X size={22} color={T.text} /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 22, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{active.name}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
              {active.bodyParts.map((p) => <span key={p} style={{ fontSize: 10.5, color: T.muted, fontFamily: T.mono, letterSpacing: 1, textTransform: "uppercase" }}>{p}</span>)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 24, color: ro ? T.muted : T.accent, display: "flex", alignItems: "center", gap: 6, animation: ro ? "none" : "" }}>
              {!ro && <span style={{ width: 7, height: 7, borderRadius: 9, background: T.accent, animation: "pulse 1.6s infinite" }} />}
              {fmtClock(dur)}
            </div>
            <div style={{ fontSize: 10, color: T.faint, fontFamily: T.mono, letterSpacing: 1 }}>{ro ? "COMPLETED" : "ELAPSED"}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", paddingBottom: 120 }}>
        {active.exercises.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: T.muted }}>
            <Dumbbell size={36} color={T.faint} />
            <div style={{ marginTop: 14, fontFamily: T.display, fontSize: 18, color: T.text }}>No exercises yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Add your first lift to start logging sets.</div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {active.exercises.map((e, i) => {
            const done = e.sets.filter((s) => s.done).length;
            const top = e.sets.reduce((m, s) => Math.max(m, s.weight || 0), 0);
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "stretch", gap: 0, animation: "slideup .25s ease" }}>
                <button onClick={() => onOpenEx(e.id)} style={{ flex: 1, textAlign: "left", cursor: "pointer", padding: "13px 14px", borderRadius: 16, background: T.surface, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 13 }}>
                  <Letter i={i} active={done === e.sets.length && e.sets.length > 0} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 16.5, letterSpacing: .2 }}>{e.name}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 3, fontSize: 11.5, color: T.muted, fontFamily: T.mono }}>
                      <span>{e.sets.length} set{e.sets.length === 1 ? "" : "s"}</span>
                      {top > 0 && <span>{top} {units}</span>}
                      {e.tempo && <span style={{ color: T.accent }}>{e.tempo}</span>}
                    </div>
                  </div>
                  {!ro && <span style={{ fontFamily: T.mono, fontSize: 12, color: done === e.sets.length ? T.good : T.faint }}>{done}/{e.sets.length}</span>}
                  <ChevronRight size={17} color={T.faint} />
                </button>
              </div>
            );
          })}
        </div>

        {!ro && (
          <button onClick={onAddExercise} style={{ width: "100%", marginTop: 12, padding: "14px", borderRadius: 16, cursor: "pointer", background: "transparent", border: `1.5px dashed ${T.line}`, color: T.accent, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.body }}>
            <Plus size={18} /> Add exercise
          </button>
        )}
      </div>

      {!ro && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px 16px", background: "rgba(18,21,25,.95)", backdropFilter: "blur(8px)", borderTop: `1px solid ${T.line}` }}>
          <button onClick={onFinish} disabled={active.exercises.length === 0} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: active.exercises.length ? "pointer" : "default", opacity: active.exercises.length ? 1 : .4, background: T.good, color: "#08240F", fontFamily: T.display, fontWeight: 700, fontSize: 17, letterSpacing: .5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Check size={20} strokeWidth={2.6} /> FINISH & SAVE
          </button>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- PICK EXERCISE ------------------------------ */
const COMMON = ["Weighted pull up", "Rack pulls", "Lat pulldown", "Single arm row", "Chest supported row", "Barbell curl", "Hammer curl", "Bench press", "Back squat", "Deadlift", "Overhead press", "Romanian deadlift"];
function PickExercise({ onBack, onPick }) {
  const [q, setQ] = useState("");
  const list = COMMON.filter((x) => x.toLowerCase().includes(q.toLowerCase()));
  const canCustom = q.trim() && !COMMON.some((x) => x.toLowerCase() === q.trim().toLowerCase());
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 760 }}>
      <TopBar title="Add exercise" onBack={onBack} />
      <div style={{ padding: "16px 16px 8px" }}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search or type a new exercise…"
          style={{ width: "100%", padding: "13px 16px", borderRadius: 14, background: T.surface, border: `1px solid ${T.line}`, color: T.text, fontSize: 15, fontFamily: T.body }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 24px" }}>
        {canCustom && (
          <button onClick={() => onPick(q.trim())} style={{ ...rowBtn, color: T.accent, marginBottom: 6 }}>
            <Plus size={18} /> <span style={{ fontWeight: 600 }}>Add “{q.trim()}”</span>
          </button>
        )}
        {list.map((x) => (
          <button key={x} onClick={() => onPick(x)} style={rowBtn}>
            <Dumbbell size={16} color={T.faint} /><span>{x}</span><ChevronRight size={16} color={T.faint} style={{ marginLeft: "auto" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
const rowBtn = { width: "100%", textAlign: "left", cursor: "pointer", padding: "14px 14px", borderRadius: 13, background: T.surface, border: `1px solid ${T.line}`, color: T.text, fontSize: 15, display: "flex", alignItems: "center", gap: 12, marginBottom: 8, fontFamily: T.body };

/* ----------------------------- EXERCISE DETAIL ---------------------------- */
function ExerciseDetail({ ex, index, total, readonly, units, onBack, onUpdate, onPrev, onNext, onAddExercise, onFinish }) {
  const [rest, setRest] = useState(0);            // rest countdown
  const restRef = useRef(null);
  useEffect(() => () => clearInterval(restRef.current), []);
  if (!ex) return null;

  function setSet(id, patch) {
    onUpdate({ sets: ex.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }
  function addSet() {
    const last = ex.sets[ex.sets.length - 1];
    onUpdate({ sets: [...ex.sets, { id: uid(), weight: last ? last.weight : "", reps: last ? last.reps : "", done: false }] });
  }
  function delSet(id) { onUpdate({ sets: ex.sets.filter((s) => s.id !== id) }); }
  function toggleDone(s) {
    const nowDone = !s.done;
    setSet(s.id, { done: nowDone });
    if (nowDone && ex.restSec > 0) startRest(ex.restSec);
  }
  function startRest(sec) {
    clearInterval(restRef.current);
    setRest(sec);
    restRef.current = setInterval(() => setRest((r) => { if (r <= 1) { clearInterval(restRef.current); return 0; } return r - 1; }), 1000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 760 }}>
      <TopBar title={ex.name} onBack={onBack} eyebrow={`Exercise ${index + 1} of ${total}`} />

      {/* tempo + rest meta */}
      <div style={{ display: "flex", gap: 10, padding: "16px 16px 6px" }}>
        <MetaField label="Tempo" mono value={ex.tempo} placeholder="3:0:0" readonly={readonly} onChange={(v) => onUpdate({ tempo: v })} />
        <MetaField label="Rest (s)" mono value={String(ex.restSec)} placeholder="60" readonly={readonly} numeric onChange={(v) => onUpdate({ restSec: parseInt(v || 0, 10) || 0 })} />
      </div>

      {/* sets table */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 180px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr 44px", gap: 8, padding: "4px 6px", fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>
          <span>Set</span><span style={{ textAlign: "center" }}>{units}</span><span style={{ textAlign: "center" }}>Reps</span><span />
        </div>
        {ex.sets.map((s, i) => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr 44px", gap: 8, alignItems: "center", padding: "6px 6px", borderRadius: 12, background: s.done ? "rgba(91,213,131,.07)" : "transparent", marginBottom: 4, animation: "pop .18s ease" }}>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18, color: s.done ? T.good : T.muted, textAlign: "center" }}>{i + 1}</div>
            <Cell value={s.weight} readonly={readonly} onChange={(v) => setSet(s.id, { weight: v === "" ? "" : Number(v) })} />
            <Cell value={s.reps} readonly={readonly} onChange={(v) => setSet(s.id, { reps: v === "" ? "" : Number(v) })} />
            {readonly ? (
              <div style={{ display: "grid", placeItems: "center" }}><Check size={18} color={s.done ? T.good : T.faint} /></div>
            ) : (
              <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <button onClick={() => toggleDone(s)} style={{ width: 34, height: 34, borderRadius: 9, cursor: "pointer", display: "grid", placeItems: "center", border: `1px solid ${s.done ? T.good : T.line}`, background: s.done ? T.good : "transparent" }}>
                  <Check size={17} strokeWidth={3} color={s.done ? "#08240F" : T.faint} />
                </button>
              </div>
            )}
          </div>
        ))}

        {!readonly && (
          <button onClick={addSet} style={{ width: "100%", marginTop: 8, padding: "12px", borderRadius: 12, cursor: "pointer", background: "transparent", border: `1.5px dashed ${T.line}`, color: T.accent, fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: T.body }}>
            <Plus size={16} /> Add set
          </button>
        )}

        {/* notes */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Pencil size={12} /> Notes</div>
          <textarea
            value={ex.notes} readOnly={readonly}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="How did it feel? e.g. last one was a fight"
            style={{ width: "100%", minHeight: 64, resize: "none", padding: "12px 14px", borderRadius: 13, background: T.surface, border: `1px solid ${T.line}`, color: T.text, fontSize: 14, fontFamily: T.body, lineHeight: 1.5 }}
          />
        </div>

        {ex.sets.length > 1 && !readonly && (
          <button onClick={() => delSet(ex.sets[ex.sets.length - 1].id)} style={{ marginTop: 14, background: "none", border: "none", color: T.danger, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Trash2 size={14} /> Remove last set
          </button>
        )}
      </div>

      {/* rest timer overlay */}
      {rest > 0 && !readonly && (
        <div style={{ position: "absolute", bottom: 132, left: 16, right: 16, padding: "14px 18px", borderRadius: 16, background: T.surface2, border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", gap: 14, animation: "slideup .2s ease", boxShadow: "0 12px 30px rgba(0,0,0,.4)" }}>
          <Timer size={22} color={T.accent} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>Rest</div>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 26, color: T.accent, lineHeight: 1 }}>{fmtClock(rest)}</div>
          </div>
          <button onClick={() => startRest(ex.restSec)} style={{ ...iconBtn, marginLeft: 0 }}><RotateCcw size={18} color={T.muted} /></button>
          <button onClick={() => setRest(0)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: "#1A1206", fontWeight: 700, fontSize: 13, fontFamily: T.body }}>Skip</button>
        </div>
      )}

      {/* footer nav — where to go next */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(18,21,25,.96)", backdropFilter: "blur(8px)", borderTop: `1px solid ${T.line}`, padding: "10px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 1, color: T.muted, textTransform: "uppercase" }}>Exercise {index + 1} of {total}</span>
          {!readonly && (
            <button onClick={onFinish} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.good, fontWeight: 700, fontSize: 13, fontFamily: T.body }}>
              <Check size={15} strokeWidth={3} /> Finish workout
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onPrev || undefined} disabled={!onPrev} style={{ flex: "0 0 auto", padding: "13px 16px", borderRadius: 13, cursor: onPrev ? "pointer" : "default", opacity: onPrev ? 1 : .35, background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 4, fontFamily: T.body }}>
            <ChevronLeft size={18} /> Prev
          </button>
          {onNext ? (
            <button onClick={onNext} style={{ flex: 1, padding: "13px", borderRadius: 13, cursor: "pointer", border: "none", background: T.accent, color: "#1A1206", fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: .3, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Next exercise <ChevronRight size={18} strokeWidth={2.6} />
            </button>
          ) : readonly ? (
            <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 13, cursor: "pointer", border: `1px solid ${T.line}`, background: "transparent", color: T.text, fontFamily: T.display, fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Back to list
            </button>
          ) : (
            <button onClick={onAddExercise} style={{ flex: 1, padding: "13px", borderRadius: 13, cursor: "pointer", border: "none", background: T.accent, color: "#1A1206", fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: .3, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={18} strokeWidth={2.6} /> Add exercise
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Cell({ value, onChange, readonly }) {
  return (
    <input
      value={value === "" || value == null ? "" : value}
      readOnly={readonly}
      inputMode="numeric"
      onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
      placeholder="—"
      style={{ width: "100%", textAlign: "center", padding: "10px 6px", borderRadius: 11, background: readonly ? "transparent" : T.surface, border: `1px solid ${readonly ? "transparent" : T.line}`, color: T.text, fontFamily: T.display, fontWeight: 600, fontSize: 19 }}
    />
  );
}

function MetaField({ label, value, placeholder, onChange, readonly, mono, numeric }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <input
        value={value} readOnly={readonly}
        inputMode={numeric ? "numeric" : "text"}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: T.surface, border: `1px solid ${T.line}`, color: value ? T.accent : T.text, fontFamily: mono ? T.mono : T.body, fontWeight: 600, fontSize: 16, textAlign: "center" }}
      />
    </div>
  );
}

/* -------------------------------- SETTINGS -------------------------------- */
function Settings({ units, setUnits, onBack, streak, count }) {
  const [out, setOut] = useState(false);
  if (out) {
    return (
      <div style={{ minHeight: 760, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <Dumbbell size={40} color={T.accent} />
          <div style={{ fontFamily: T.display, fontSize: 24, fontWeight: 600, marginTop: 16 }}>Logged out</div>
          <div style={{ color: T.muted, fontSize: 14, marginTop: 6 }}>See you for the next session.</div>
          <button onClick={() => setOut(false)} style={{ marginTop: 22, padding: "12px 26px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.surface, color: T.text, fontWeight: 600, cursor: "pointer", fontFamily: T.body }}>Log back in</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="Settings" onBack={onBack} />
      {/* profile */}
      <div style={{ padding: "20px 20px 6px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: T.accentDim, border: `1px solid ${T.accent}`, display: "grid", placeItems: "center", fontFamily: T.display, fontWeight: 700, fontSize: 24, color: T.accent }}>JD</div>
        <div>
          <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 20 }}>Jordan Doe</div>
          <div style={{ fontSize: 12.5, color: T.muted }}>{count} workouts · {streak} day streak</div>
        </div>
      </div>

      <div style={{ padding: "18px 16px 8px", fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>Preferences</div>
      <div style={{ margin: "0 16px", borderRadius: 16, background: T.surface, border: `1px solid ${T.line}`, overflow: "hidden" }}>
        <div style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 15 }}>Units</span>
          <div style={{ display: "flex", background: T.bg, borderRadius: 10, padding: 3, border: `1px solid ${T.line}` }}>
            {["lb", "kg"].map((u) => (
              <button key={u} onClick={() => setUnits(u)} style={{ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontFamily: T.display, fontSize: 14, background: units === u ? T.accent : "transparent", color: units === u ? "#1A1206" : T.muted }}>{u.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15 }}>Default rest</span>
          <span style={{ fontFamily: T.mono, color: T.muted }}>60s</span>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <button onClick={() => setOut(true)} style={{ width: "100%", padding: 15, borderRadius: 14, cursor: "pointer", background: "transparent", border: `1px solid ${T.danger}`, color: T.danger, fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.body }}>
          <LogOut size={18} /> Log out
        </button>
      </div>
      <BottomNav tab="settings" onHome={onBack} onHistory={onBack} onSettings={() => {}} />
    </div>
  );
}
