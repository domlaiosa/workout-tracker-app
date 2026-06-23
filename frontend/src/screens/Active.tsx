import { X, Plus, Check, Dumbbell, ChevronRight, Trash2 } from "lucide-react";
import { T } from "../theme";
import { Letter, iconBtn } from "../components";
import { fmtClock } from "../data";
import type { Id, Units, WorkoutSession } from "../types";

export function Active({
  active, elapsed, units, isSaving, error, onClose, onAddExercise, onOpenEx, onSave, onDelete,
}: {
  active: WorkoutSession;
  elapsed: number;
  units: Units;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onAddExercise: () => void;
  onOpenEx: (id: Id) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const persisted = Boolean(active.persisted);
  const dur = persisted ? active.durationSec ?? 0 : elapsed;
  const canSave = active.exercises.length > 0 && !isSaving;
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
          {persisted && (
            <button onClick={onDelete} disabled={isSaving} title="Delete workout" style={{ ...iconBtn, marginLeft: 0, opacity: isSaving ? .4 : 1 }}>
              <Trash2 size={20} color={T.danger} />
            </button>
          )}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 24, color: persisted ? T.muted : T.accent, display: "flex", alignItems: "center", gap: 6 }}>
              {!persisted && <span style={{ width: 7, height: 7, borderRadius: 9, background: T.accent, animation: "pulse 1.6s infinite" }} />}
              {fmtClock(dur)}
            </div>
            <div style={{ fontSize: 10, color: T.faint, fontFamily: T.mono, letterSpacing: 1 }}>{persisted ? "DURATION" : "ELAPSED"}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", paddingBottom: 140 }}>
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
            const top = e.sets.reduce((m, s) => Math.max(m, Number(s.weight) || 0), 0);
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
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: done === e.sets.length ? T.good : T.faint }}>{done}/{e.sets.length}</span>
                  <ChevronRight size={17} color={T.faint} />
                </button>
              </div>
            );
          })}
        </div>

        <button onClick={onAddExercise} style={{ width: "100%", marginTop: 12, padding: "14px", borderRadius: 16, cursor: "pointer", background: "transparent", border: `1.5px dashed ${T.line}`, color: T.accent, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.body }}>
          <Plus size={18} /> Add exercise
        </button>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px 16px", background: "rgba(18,21,25,.95)", backdropFilter: "blur(8px)", borderTop: `1px solid ${T.line}` }}>
        {error && <div style={{ color: T.danger, fontSize: 12.5, marginBottom: 8, textAlign: "center" }}>{error}</div>}
        <button onClick={onSave} disabled={!canSave} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: canSave ? "pointer" : "default", opacity: canSave ? 1 : .4, background: T.good, color: "#08240F", fontFamily: T.display, fontWeight: 700, fontSize: 17, letterSpacing: .5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Check size={20} strokeWidth={2.6} /> {isSaving ? "SAVING…" : persisted ? "SAVE CHANGES" : "FINISH & SAVE"}
        </button>
      </div>
    </div>
  );
}
