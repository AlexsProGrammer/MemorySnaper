import { Play, Pause, Square, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type ActionBarProps = {
  canStart: boolean;
  canPauseOrStop: boolean;
  isPaused: boolean;
  isStopped: boolean;
  isWorking: boolean;
  onStart: () => void;
  onPauseOrResume: () => void;
  onStop: () => void;
};

export function ActionBar({
  canStart,
  canPauseOrStop,
  isPaused,
  isStopped,
  isWorking,
  onStart,
  onPauseOrResume,
  onStop,
}: ActionBarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
      <Button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="gap-2"
      >
        {isWorking && !isStopped ? (
          <Loader2 className={`h-4 w-4 animate-spin ${isPaused ? "[animation-play-state:paused]" : ""}`} />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {t("downloader.actions.start")}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onPauseOrResume}
        disabled={!canPauseOrStop}
        className="gap-2"
      >
        {isPaused ? (
          <Play className="h-4 w-4" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
        {isPaused ? t("downloader.actions.resume") : t("downloader.actions.pause")}
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={onStop}
        disabled={!canPauseOrStop}
        className="gap-2"
      >
        <Square className="h-4 w-4" />
        {t("downloader.actions.stop")}
      </Button>
    </div>
  );
}
