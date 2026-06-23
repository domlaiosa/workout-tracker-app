import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { T, FONTS } from "./theme";
import { uid, computeStreak, totalVolume } from "./data";
import { useWorkouts } from "./hooks/useWorkouts";
import type { Draft, Exercise, Id, LibraryExercise, Screen, Units, WorkoutSession } from "./types";
import { Home } from "./screens/Home";
import { HistoryList } from "./screens/History";
import { Setup } from "./screens/Setup";
import { Active } from "./screens/Active";
import { PickExercise } from "./screens/PickExercise";
import { ExerciseDetail } from "./screens/ExerciseDetail";
import { Settings } from "./screens/Settings";

/* ================================== APP =================================== */
export default function App() {
  const { workouts, isLoading, error, create, update, remove } = useWorkouts();

  const [screen, setScreen] = useState<Screen>("home");
  const [active, setActive] = useState<WorkoutSession | null>(null); // workout being logged/edited
  const [openEx, setOpenEx] = useState<Id | null>(null);             // exercise id open in detail
  const [units, setUnits] = useState<Units>("lb");
  const [draft, setDraft] = useState<Draft>({ name: "", parts: [] });

  const [elapsed, setElapsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // live workout clock — only ticks for a brand-new (unsaved) session
  useEffect(() => {
    if (!active || active.persisted) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const streak = computeStreak(workouts);
  const weekCount = workouts.filter((w) => Date.now() - w.date < 7 * 86400000).length;
  const weekVolume = workouts
    .filter((w) => Date.now() - w.date < 7 * 86400000)
    .reduce((a, w) => a + totalVolume(w), 0);

  /* --- navigation --- */
  function goHome() {
    setActive(null);
    setOpenEx(null);
    setActionError(null);
    setScreen("home");
  }
  function beginSetup() {
    setDraft({ name: "", parts: [] });
    setScreen("setup");
  }
  function startWorkout() {
    const day = new Date().toLocaleDateString(undefined, { weekday: "long" });
    const fallback = draft.parts.length ? `${day} · ${draft.parts.join(" / ")}` : `${day} workout`;
    setActive({ id: uid(), name: draft.name.trim() || fallback, date: Date.now(), bodyParts: draft.parts, exercises: [] });
    setElapsed(0);
    setActionError(null);
    setScreen("active");
  }
  function openSession(w: WorkoutSession) {
    setActive({ ...w }); // editable copy
    setActionError(null);
    setScreen("active");
  }

  /* --- workout mutations (local draft) --- */
  function addExercise(lib: LibraryExercise) {
    const ex: Exercise = {
      id: uid(), exerciseId: lib.id, name: lib.name, tempo: "", restSec: 60, notes: "",
      sets: [{ id: uid(), weight: "", reps: "", done: false }],
    };
    setActive((a) => (a ? { ...a, exercises: [...a.exercises, ex] } : a));
    setOpenEx(ex.id);
    setScreen("exercise");
  }
  function updateEx(exId: Id, patch: Partial<Exercise>) {
    setActive((a) => (a ? { ...a, exercises: a.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) } : a));
  }
  function removeEx(exId: Id) {
    setActive((a) => (a ? { ...a, exercises: a.exercises.filter((e) => e.id !== exId) } : a));
    setScreen("active");
  }

  /* --- persistence --- */
  async function saveActive() {
    if (!active || isSaving) return;
    const session = active.persisted ? active : { ...active, durationSec: elapsed };
    setIsSaving(true);
    setActionError(null);
    try {
      if (active.persisted) await update(Number(active.id), session);
      else await create(session);
      setIsSaving(false);
      goHome();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to save workout");
      setIsSaving(false);
    }
  }
  async function deleteActive() {
    if (!active || !active.persisted || isSaving) return;
    if (!window.confirm("Delete this workout? This can't be undone.")) return;
    setIsSaving(true);
    setActionError(null);
    try {
      await remove(Number(active.id));
      setIsSaving(false);
      goHome();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to delete workout");
      setIsSaving(false);
    }
  }

  const shell: CSSProperties = {
    fontFamily: T.body, background: T.bg, color: T.text, width: "100%", maxWidth: 430,
    margin: "0 auto", minHeight: 760, position: "relative", overflow: "hidden",
    border: `1px solid ${T.line}`, borderRadius: 28, boxShadow: "0 30px 80px rgba(0,0,0,.45)",
  };

  return (
    <div style={{ background: "#0B0D10", padding: "24px 12px", display: "flex", justifyContent: "center", minHeight: "100vh" }}>
      <style>{FONTS}</style>
      <div style={shell}>
        {screen === "home" && (
          <Home
            streak={streak}
            weekCount={weekCount}
            weekVolume={weekVolume}
            history={workouts}
            units={units}
            isLoading={isLoading}
            error={error}
            onStart={beginSetup}
            onGoSettings={() => setScreen("settings")}
            onGoHistory={() => setScreen("history")}
            onOpen={openSession}
          />
        )}
        {screen === "history" && (
          <HistoryList
            history={workouts}
            units={units}
            isLoading={isLoading}
            error={error}
            onBack={goHome}
            onOpen={openSession}
            onGoSettings={() => setScreen("settings")}
          />
        )}
        {screen === "setup" && (
          <Setup draft={draft} setDraft={setDraft} onBack={goHome} onStart={startWorkout} />
        )}
        {screen === "active" && active && (
          <Active
            active={active}
            elapsed={elapsed}
            units={units}
            isSaving={isSaving}
            error={actionError}
            onClose={goHome}
            onAddExercise={() => setScreen("pickExercise")}
            onOpenEx={(id) => { setOpenEx(id); setScreen("exercise"); }}
            onSave={saveActive}
            onDelete={deleteActive}
          />
        )}
        {screen === "pickExercise" && (
          <PickExercise onBack={() => setScreen("active")} onPick={addExercise} />
        )}
        {screen === "exercise" && active && (() => {
          const idx = active.exercises.findIndex((e) => e.id === openEx);
          const total = active.exercises.length;
          const goTo = (i: number) => setOpenEx(active.exercises[i].id);
          return (
            <ExerciseDetail
              ex={active.exercises[idx]}
              index={idx}
              total={total}
              units={units}
              persisted={Boolean(active.persisted)}
              isSaving={isSaving}
              onBack={() => setScreen("active")}
              onUpdate={(patch) => { if (openEx != null) updateEx(openEx, patch); }}
              onRemove={() => { if (openEx != null) removeEx(openEx); }}
              onPrev={idx > 0 ? () => goTo(idx - 1) : null}
              onNext={idx < total - 1 ? () => goTo(idx + 1) : null}
              onAddExercise={() => setScreen("pickExercise")}
              onSave={saveActive}
            />
          );
        })()}
        {screen === "settings" && (
          <Settings units={units} setUnits={setUnits} onBack={goHome} streak={streak} count={workouts.length} />
        )}
      </div>
    </div>
  );
}
