import { Plus, Flame } from "lucide-react";
import { T } from "../theme";
import { Stat, WorkoutCard, BottomNav, ListState } from "../components";
import type { Units, WorkoutSession } from "../types";

export function Home({
  streak, weekCount, weekVolume, history, units, isLoading, error, onStart, onGoSettings, onGoHistory, onOpen,
}: {
  streak: number;
  weekCount: number;
  weekVolume: number;
  history: WorkoutSession[];
  units: Units;
  isLoading: boolean;
  error: string | null;
  onStart: () => void;
  onGoSettings: () => void;
  onGoHistory: () => void;
  onOpen: (w: WorkoutSession) => void;
}) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const recent = history.slice(0, 4);
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
        <ListState isLoading={isLoading} error={error} isEmpty={recent.length === 0} emptyText="No workouts yet. Start your first one above.">
          {recent.map((w) => <WorkoutCard key={w.id} w={w} units={units} onClick={() => onOpen(w)} />)}
        </ListState>
      </div>

      <BottomNav tab="home" onHome={() => {}} onHistory={onGoHistory} onSettings={onGoSettings} />
    </div>
  );
}
