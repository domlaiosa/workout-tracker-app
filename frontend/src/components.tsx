import type { CSSProperties, ReactNode } from "react";
import {
  ChevronLeft, ChevronRight, Calendar, Dumbbell, Clock,
  Home as HomeIcon, History as HistoryIcon, Settings as SettingsIcon,
} from "lucide-react";
import { T } from "./theme";
import { LETTERS, relDay, fmtDur, totalVolume } from "./data";
import type { Units, WorkoutSession } from "./types";

/* -------------------------------- shared UI ------------------------------- */
/** Renders loading / error / empty placeholders, or the children when data is ready. */
export function ListState({
  isLoading, error, isEmpty, emptyText, children,
}: {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  const wrap: CSSProperties = { textAlign: "center", padding: "40px 20px", color: T.muted, fontSize: 13.5 };
  if (isLoading) {
    return <div style={{ ...wrap, fontFamily: T.mono, letterSpacing: 1, textTransform: "uppercase", fontSize: 11, animation: "pulse 1.4s infinite" }}>Loading…</div>;
  }
  if (error) {
    return <div style={{ ...wrap, color: T.danger }}>{error}</div>;
  }
  if (isEmpty) {
    return <div style={wrap}>{emptyText}</div>;
  }
  return <>{children}</>;
}

export const iconBtn: CSSProperties = {
  background: "transparent", border: "none", padding: 4, cursor: "pointer",
  display: "flex", alignItems: "center", marginLeft: -4,
};

export const rowBtn: CSSProperties = {
  width: "100%", textAlign: "left", cursor: "pointer", padding: "14px 14px", borderRadius: 13,
  background: T.surface, border: `1px solid ${T.line}`, color: T.text, fontSize: 15,
  display: "flex", alignItems: "center", gap: 12, marginBottom: 8, fontFamily: T.body,
};

export function TopBar({
  title, onBack, right, eyebrow,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  eyebrow?: string;
}) {
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

export function Letter({ i, active }: { i: number; active: boolean }) {
  return (
    <div style={{
      width: 34, height: 34, flexShrink: 0, display: "grid", placeItems: "center",
      fontFamily: T.display, fontWeight: 700, fontSize: 18, borderRadius: 9,
      background: active ? T.accent : T.surface2, color: active ? "#1A1206" : T.muted,
      border: `1px solid ${active ? T.accent : T.line}`,
    }}>{LETTERS[i]}</div>
  );
}

export type Tab = "home" | "history" | "settings";

export function BottomNav({
  tab, onHome, onHistory, onSettings,
}: {
  tab: Tab;
  onHome: () => void;
  onHistory: () => void;
  onSettings: () => void;
}) {
  const item = (key: Tab, Icon: typeof HomeIcon, label: string, fn: () => void) => (
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

export function Stat({ label, value, unit }: { label: string; value: ReactNode; unit: string }) {
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

export function WorkoutCard({ w, units, onClick }: { w: WorkoutSession; units: Units; onClick: () => void }) {
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

export function Cell({ value, onChange, readonly }: { value: number | ""; onChange: (v: string) => void; readonly?: boolean }) {
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

export function MetaField({
  label, value, placeholder, onChange, readonly, mono, numeric,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  readonly?: boolean;
  mono?: boolean;
  numeric?: boolean;
}) {
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
