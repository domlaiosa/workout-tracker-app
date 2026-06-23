import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { TopBar } from "../components";
import { T } from "../theme";
import { BODY_PARTS } from "../data";
import type { Draft } from "../types";

export function Setup({
  draft, setDraft, onBack, onStart,
}: {
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  onBack: () => void;
  onStart: () => void;
}) {
  const toggle = (p: string) =>
    setDraft((d) => ({ ...d, parts: d.parts.includes(p) ? d.parts.filter((x) => x !== p) : [...d.parts, p] }));
  const now = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
  const dateStr = now.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  const ready = draft.parts.length > 0;
  const cap: CSSProperties = { fontFamily: T.mono, fontSize: 11, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" };
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
