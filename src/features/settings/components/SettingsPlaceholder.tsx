import { SettingsForm } from "@/features/settings/components/SettingsForm";
import { useI18n } from "@/lib/i18n";

export function SettingsPlaceholder() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      <div className="space-y-1 pb-3">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("settings.card.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("settings.card.description")}
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
