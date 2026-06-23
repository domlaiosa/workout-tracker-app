import { useState } from "react";
import { Dumbbell, ChevronRight } from "lucide-react";
import { T } from "../theme";
import { TopBar, rowBtn, ListState } from "../components";
import { useExerciseSearch } from "../hooks/useExerciseSearch";
import type { LibraryExercise } from "../types";

export function PickExercise({ onBack, onPick }: { onBack: () => void; onPick: (ex: LibraryExercise) => void }) {
  const [q, setQ] = useState("");
  const { results, isLoading, error } = useExerciseSearch(q);
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 760 }}>
      <TopBar title="Add exercise" onBack={onBack} />
      <div style={{ padding: "16px 16px 8px" }}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the exercise library…"
          style={{ width: "100%", padding: "13px 16px", borderRadius: 14, background: T.surface, border: `1px solid ${T.line}`, color: T.text, fontSize: 15, fontFamily: T.body }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 24px" }}>
        <ListState
          isLoading={isLoading}
          error={error}
          isEmpty={results.length === 0}
          emptyText={q.trim() ? `No exercises match “${q.trim()}”.` : "No exercises found."}
        >
          {results.map((x) => (
            <button key={x.id} onClick={() => onPick(x)} style={rowBtn}>
              <Dumbbell size={16} color={T.faint} />
              <span style={{ flex: 1, minWidth: 0 }}>{x.name}</span>
              {x.category && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, textTransform: "capitalize" }}>{x.category}</span>}
              <ChevronRight size={16} color={T.faint} />
            </button>
          ))}
        </ListState>
      </div>
    </div>
  );
}
