import { useMemo, type ReactNode } from "react";
import { CalendarIcon, Search, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  countActiveFilters,
  DEFAULT_FILTER_STATE,
  type FilterMeta,
  type TimeSlot,
  type ViewerFilterState,
} from "@/features/viewer/viewer-filters";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n-messages";
import { cn } from "@/lib/utils";
import type { ViewerMediaKind } from "@/lib/memories-api";

export type ViewerFilterBarProps = {
  filters: ViewerFilterState;
  onChange: (filters: ViewerFilterState) => void;
  filterMeta: FilterMeta;
  totalCount: number;
  filteredCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateLabel(date: Date | null, fallbackLabel: string): string {
  if (!date) {
    return fallbackLabel;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</Label>;
}

const TIME_SLOT_KEYS: Record<TimeSlot, TranslationKey> = {
  morning: "viewer.filters.timeSlot.morning",
  afternoon: "viewer.filters.timeSlot.afternoon",
  evening: "viewer.filters.timeSlot.evening",
  night: "viewer.filters.timeSlot.night",
};

export function ViewerFilterBar({
  filters,
  onChange,
  filterMeta,
  totalCount,
  filteredCount,
  open,
  onOpenChange,
}: ViewerFilterBarProps) {
  const { t } = useI18n();

  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  const patchFilters = (patch: Partial<ViewerFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {/* Inline search */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("viewer.filters.searchPlaceholder")}
          aria-label={t("viewer.filters.searchPlaceholder")}
          className="pl-8"
          value={filters.searchQuery}
          onChange={(event) => {
            patchFilters({ searchQuery: event.target.value });
          }}
        />
      </div>

      {/* Sheet trigger */}
      <Button
        type="button"
        variant="outline"
        className="gap-1.5"
        onClick={() => { onOpenChange(true); }}
      >
        <SlidersHorizontal className="size-4" />
        {t("viewer.filters.filtersButton")}
        {activeCount > 0 ? (
          <Badge variant="secondary" className="ml-0.5 px-1.5">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      {/* Filter Sheet */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="flex w-80 flex-col sm:w-96">
          <SheetHeader>
            <SheetTitle>{t("viewer.filters.filtersButton")}</SheetTitle>
            <SheetDescription>
              {t("viewer.filters.resultsCount", { filtered: filteredCount, total: totalCount })}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-5 pb-4">
              {/* Media Type */}
              <div className="space-y-2">
                <SectionTitle>{t("viewer.filters.mediaType")}</SectionTitle>
                <ToggleGroup
                  type="multiple"
                  size="sm"
                  variant="outline"
                  value={[...filters.mediaKinds]}
                  onValueChange={(value) => {
                    patchFilters({ mediaKinds: new Set(value as ViewerMediaKind[]) });
                  }}
                >
                  <ToggleGroupItem value="image">
                    {t("viewer.filters.mediaType.image")}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="video">
                    {t("viewer.filters.mediaType.video")}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Separator />

              {/* Date Range */}
              <div className="space-y-2">
                <SectionTitle>{t("viewer.filters.dateRange")}</SectionTitle>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("viewer.filters.dateFrom")}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => { patchFilters({ dateFrom: null }); }}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {formatDateLabel(filters.dateFrom, t("viewer.filters.selectDate"))}
                      {filters.dateFrom ? <X className="ml-auto size-3.5 text-muted-foreground" /> : null}
                    </Button>
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom ?? undefined}
                      onSelect={(date) => {
                        patchFilters({ dateFrom: date ?? null });
                      }}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("viewer.filters.dateTo")}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => { patchFilters({ dateTo: null }); }}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {formatDateLabel(filters.dateTo, t("viewer.filters.selectDate"))}
                      {filters.dateTo ? <X className="ml-auto size-3.5 text-muted-foreground" /> : null}
                    </Button>
                    <Calendar
                      mode="single"
                      selected={filters.dateTo ?? undefined}
                      onSelect={(date) => {
                        patchFilters({ dateTo: date ?? null });
                      }}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Time of Day */}
              <div className="space-y-2">
                <SectionTitle>{t("viewer.filters.timeOfDay")}</SectionTitle>
                <ToggleGroup
                  type="multiple"
                  size="sm"
                  variant="outline"
                  className="flex-wrap"
                  value={[...filters.timeSlots]}
                  onValueChange={(value) => {
                    patchFilters({ timeSlots: new Set(value as TimeSlot[]) });
                  }}
                >
                  {(["morning", "afternoon", "evening", "night"] as TimeSlot[]).map((slot) => (
                    <ToggleGroupItem key={slot} value={slot}>
                      {t(TIME_SLOT_KEYS[slot])}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <Separator />

              {/* Location */}
              <div className="space-y-2">
                <SectionTitle>{t("viewer.filters.location")}</SectionTitle>
                <Input
                  placeholder={t("viewer.filters.locationPlaceholder")}
                  aria-label={t("viewer.filters.locationPlaceholder")}
                  value={filters.locationQuery}
                  onChange={(event) => {
                    patchFilters({ locationQuery: event.target.value });
                  }}
                />
                <Label className="text-sm font-normal">
                  <Checkbox
                    checked={filters.hasLocationOnly}
                    onCheckedChange={(checked) => {
                      patchFilters({ hasLocationOnly: checked === true });
                    }}
                  />
                  {t("viewer.filters.hasLocationOnly")}
                </Label>
              </div>

              <Separator />

              {/* Media Format */}
              <div className="space-y-2">
                <SectionTitle>{t("viewer.filters.mediaFormat")}</SectionTitle>
                {filterMeta.uniqueFormats.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("viewer.filters.noFormatMetadata")}</p>
                ) : (
                  <div className="grid gap-1">
                    {filterMeta.uniqueFormats.map((format) => (
                      <Label key={format} className="text-sm font-normal">
                        <Checkbox
                          checked={filters.mediaFormats.has(format)}
                          onCheckedChange={() => {
                            patchFilters({
                              mediaFormats: new Set(
                                filters.mediaFormats.has(format)
                                  ? [...filters.mediaFormats].filter((f) => f !== format)
                                  : [...filters.mediaFormats, format],
                              ),
                            });
                          }}
                        />
                        {format}
                      </Label>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Countries */}
              <div className="space-y-2">
                <SectionTitle>{t("viewer.filters.countries")}</SectionTitle>
                {filterMeta.uniqueCountries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("viewer.filters.noCountryMetadata")}</p>
                ) : (
                  <div className="grid gap-1">
                    {filterMeta.uniqueCountries.map((country) => (
                      <Label key={country} className="text-sm font-normal">
                        <Checkbox
                          checked={filters.countries.has(country)}
                          onCheckedChange={() => {
                            patchFilters({
                              countries: new Set(
                                filters.countries.has(country)
                                  ? [...filters.countries].filter((c) => c !== country)
                                  : [...filters.countries, country],
                              ),
                            });
                          }}
                        />
                        {country}
                      </Label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="flex-row items-center gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange({
                  ...DEFAULT_FILTER_STATE,
                  mediaKinds: new Set(),
                  mediaFormats: new Set(),
                  timeSlots: new Set(),
                  countries: new Set(),
                });
              }}
              disabled={activeCount === 0}
              className="gap-1"
            >
              <X className="size-3.5" />
              {t("viewer.filters.clearFilters")}
            </Button>

            <span className={cn("ml-auto text-xs text-muted-foreground", activeCount > 0 && "text-foreground")}>
              {t("viewer.filters.resultsCount", { filtered: filteredCount, total: totalCount })}
            </span>

            <SheetClose asChild>
              <Button type="button" size="sm">
                {t("viewer.filters.done")}
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
