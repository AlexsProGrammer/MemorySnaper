import { Workflow } from "@/features/downloader/components/Workflow";
import { useI18n } from "@/lib/i18n";

export function DownloaderPlaceholder() {
  const { t } = useI18n();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("downloader.card.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("downloader.card.description")}
        </p>
      </div>
      <Workflow />
    </div>
  );
}
