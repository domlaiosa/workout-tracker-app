import { TopBar, WorkoutCard, BottomNav, ListState } from "../components";
import type { Units, WorkoutSession } from "../types";

export function HistoryList({
  history, units, isLoading, error, onBack, onOpen, onGoSettings,
}: {
  history: WorkoutSession[];
  units: Units;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onOpen: (w: WorkoutSession) => void;
  onGoSettings: () => void;
}) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="History" onBack={onBack} eyebrow={`${history.length} session${history.length === 1 ? "" : "s"}`} />
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <ListState isLoading={isLoading} error={error} isEmpty={history.length === 0} emptyText="No workouts logged yet.">
          {history.map((w) => <WorkoutCard key={w.id} w={w} units={units} onClick={() => onOpen(w)} />)}
        </ListState>
      </div>
      <BottomNav tab="history" onHome={onBack} onHistory={() => {}} onSettings={onGoSettings} />
    </div>
  );
}
