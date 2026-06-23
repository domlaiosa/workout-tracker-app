import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Check, Trash2, Pencil, Timer, RotateCcw,
} from "lucide-react";
import { T } from "../theme";
import { TopBar, Cell, MetaField, iconBtn } from "../components";
import { uid, fmtClock } from "../data";
import type { Exercise, SetEntry, Units } from "../types";

export function ExerciseDetail({
  ex, index, total, units, persisted, isSaving, onBack, onUpdate, onRemove, onPrev, onNext, onAddExercise, onSave,
}: {
  ex: Exercise | undefined;
  index: number;
  total: number;
  units: Units;
  persisted: boolean;
  isSaving: boolean;
  onBack: () => void;
  onUpdate: (patch: Partial<Exercise>) => void;
  onRemove: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
  onAddExercise: () => void;
  onSave: () => void;
}) {
  const [rest, setRest] = useState(0); // rest countdown
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (restRef.current) clearInterval(restRef.current); }, []);
  if (!ex) return null;
  const exercise = ex;

  function setSet(id: SetEntry["id"], patch: Partial<SetEntry>) {
    onUpdate({ sets: exercise.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }
  function addSet() {
    const last = exercise.sets[exercise.sets.length - 1];
    onUpdate({ sets: [...exercise.sets, { id: uid(), weight: last ? last.weight : "", reps: last ? last.reps : "", done: false }] });
  }
  function delSet(id: SetEntry["id"]) {
    onUpdate({ sets: exercise.sets.filter((s) => s.id !== id) });
  }
  function toggleDone(s: SetEntry) {
    const nowDone = !s.done;
    setSet(s.id, { done: nowDone });
    if (nowDone && exercise.restSec > 0) startRest(exercise.restSec);
  }
  function startRest(sec: number) {
    if (restRef.current) clearInterval(restRef.current);
    setRest(sec);
    restRef.current = setInterval(() => setRest((r) => {
      if (r <= 1) { if (restRef.current) clearInterval(restRef.current); return 0; }
      return r - 1;
    }), 1000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 760 }}>
      <TopBar title={ex.name} onBack={onBack} eyebrow={`Exercise ${index + 1} of ${total}`} />

      {/* tempo + rest meta */}
      <div style={{ display: "flex", gap: 10, padding: "16px 16px 6px" }}>
        <MetaField label="Tempo" mono value={ex.tempo} placeholder="3:0:0" onChange={(v) => onUpdate({ tempo: v })} />
        <MetaField label="Rest (s)" mono value={String(ex.restSec)} placeholder="60" numeric onChange={(v) => onUpdate({ restSec: parseInt(v, 10) || 0 })} />
      </div>

      {/* sets table */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 180px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr 44px", gap: 8, padding: "4px 6px", fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>
          <span>Set</span><span style={{ textAlign: "center" }}>{units}</span><span style={{ textAlign: "center" }}>Reps</span><span />
        </div>
        {ex.sets.map((s, i) => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr 44px", gap: 8, alignItems: "center", padding: "6px 6px", borderRadius: 12, background: s.done ? "rgba(91,213,131,.07)" : "transparent", marginBottom: 4, animation: "pop .18s ease" }}>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18, color: s.done ? T.good : T.muted, textAlign: "center" }}>{i + 1}</div>
            <Cell value={s.weight} onChange={(v) => setSet(s.id, { weight: v === "" ? "" : Number(v) })} />
            <Cell value={s.reps} onChange={(v) => setSet(s.id, { reps: v === "" ? "" : Number(v) })} />
            <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <button onClick={() => toggleDone(s)} style={{ width: 34, height: 34, borderRadius: 9, cursor: "pointer", display: "grid", placeItems: "center", border: `1px solid ${s.done ? T.good : T.line}`, background: s.done ? T.good : "transparent" }}>
                <Check size={17} strokeWidth={3} color={s.done ? "#08240F" : T.faint} />
              </button>
            </div>
          </div>
        ))}

        <button onClick={addSet} style={{ width: "100%", marginTop: 8, padding: "12px", borderRadius: 12, cursor: "pointer", background: "transparent", border: `1.5px dashed ${T.line}`, color: T.accent, fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: T.body }}>
          <Plus size={16} /> Add set
        </button>

        {/* notes */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Pencil size={12} /> Notes</div>
          <textarea
            value={ex.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="How did it feel? e.g. last one was a fight"
            style={{ width: "100%", minHeight: 64, resize: "none", padding: "12px 14px", borderRadius: 13, background: T.surface, border: `1px solid ${T.line}`, color: T.text, fontSize: 14, fontFamily: T.body, lineHeight: 1.5 }}
          />
        </div>

        <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
          {ex.sets.length > 1 && (
            <button onClick={() => delSet(exercise.sets[exercise.sets.length - 1].id)} style={{ background: "none", border: "none", color: T.danger, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
              <Trash2 size={14} /> Remove last set
            </button>
          )}
          <button onClick={onRemove} style={{ background: "none", border: "none", color: T.danger, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Trash2 size={14} /> Remove exercise
          </button>
        </div>
      </div>

      {/* rest timer overlay */}
      {rest > 0 && (
        <div style={{ position: "absolute", bottom: 132, left: 16, right: 16, padding: "14px 18px", borderRadius: 16, background: T.surface2, border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", gap: 14, animation: "slideup .2s ease", boxShadow: "0 12px 30px rgba(0,0,0,.4)" }}>
          <Timer size={22} color={T.accent} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>Rest</div>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 26, color: T.accent, lineHeight: 1 }}>{fmtClock(rest)}</div>
          </div>
          <button onClick={() => startRest(exercise.restSec)} style={{ ...iconBtn, marginLeft: 0 }}><RotateCcw size={18} color={T.muted} /></button>
          <button onClick={() => setRest(0)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: T.accent, color: "#1A1206", fontWeight: 700, fontSize: 13, fontFamily: T.body }}>Skip</button>
        </div>
      )}

      {/* footer nav — where to go next */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(18,21,25,.96)", backdropFilter: "blur(8px)", borderTop: `1px solid ${T.line}`, padding: "10px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 1, color: T.muted, textTransform: "uppercase" }}>Exercise {index + 1} of {total}</span>
          <button onClick={onSave} disabled={isSaving} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: isSaving ? "default" : "pointer", opacity: isSaving ? .5 : 1, color: T.good, fontWeight: 700, fontSize: 13, fontFamily: T.body }}>
            <Check size={15} strokeWidth={3} /> {isSaving ? "Saving…" : persisted ? "Save changes" : "Finish workout"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onPrev || undefined} disabled={!onPrev} style={{ flex: "0 0 auto", padding: "13px 16px", borderRadius: 13, cursor: onPrev ? "pointer" : "default", opacity: onPrev ? 1 : .35, background: "transparent", border: `1px solid ${T.line}`, color: T.text, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 4, fontFamily: T.body }}>
            <ChevronLeft size={18} /> Prev
          </button>
          {onNext ? (
            <button onClick={onNext} style={{ flex: 1, padding: "13px", borderRadius: 13, cursor: "pointer", border: "none", background: T.accent, color: "#1A1206", fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: .3, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Next exercise <ChevronRight size={18} strokeWidth={2.6} />
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
