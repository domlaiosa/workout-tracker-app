import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Dumbbell, LogOut } from "lucide-react";
import { T } from "../theme";
import { TopBar, BottomNav } from "../components";
import type { Units } from "../types";

export function Settings({
  units, setUnits, onBack, streak, count,
}: {
  units: Units;
  setUnits: Dispatch<SetStateAction<Units>>;
  onBack: () => void;
  streak: number;
  count: number;
}) {
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
            {(["lb", "kg"] as const).map((u) => (
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
