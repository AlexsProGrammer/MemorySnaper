import { SettingsForm } from "@/features/settings/components/SettingsForm";
import { useI18n } from "@/lib/i18n";

export function SettingsPlaceholder() {
  const { t } = useI18n();

  return (
    <div className="-mx-4 min-h-full bg-background px-4 overflow-hidden sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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
    </div>
  );
}
