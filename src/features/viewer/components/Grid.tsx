import { useMemo, useRef, useState } from "react";

import { Film, ImageIcon } from "lucide-react";
import { Tooltip } from "radix-ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  formatViewerFullDate,
  formatViewerShortDate,
} from "@/features/viewer/viewer-dates";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ViewerMediaKind } from "@/lib/memories-api";

export type ThumbnailItem = {
  id: string;
  src?: string;
  dateTaken: string;
  mediaKind: ViewerMediaKind;
  location?: string;
  rawLocation?: string;
  mediaIndex: number;
};

export type GridStickyHeader = {
  variant: "dated" | "unknown";
  yearLabel: string | null;
  monthLabel: string | null;
};

export type GridTimelineRow =
  | {
      kind: "year" | "month" | "unknown";
      id: string;
      label: string;
      stickyHeader: GridStickyHeader;
    }
  | {
      kind: "media";
      id: string;
      items: ThumbnailItem[];
      stickyHeader: GridStickyHeader;
    };

type GridProps = {
  rows: GridTimelineRow[];
  onItemSelect?: (index: number) => void;
};

export const GRID_COLUMNS = 4;
const ESTIMATED_MEDIA_ROW_HEIGHT = 220;
const ESTIMATED_YEAR_ROW_HEIGHT = 60;
const ESTIMATED_MONTH_ROW_HEIGHT = 52;

function estimateRowHeight(row: GridTimelineRow | undefined): number {
  if (!row) {
    return ESTIMATED_MEDIA_ROW_HEIGHT;
  }

  switch (row.kind) {
    case "media":
      return ESTIMATED_MEDIA_ROW_HEIGHT;
    case "year":
      return ESTIMATED_YEAR_ROW_HEIGHT;
    case "month":
    case "unknown":
      return ESTIMATED_MONTH_ROW_HEIGHT;
    default:
      return ESTIMATED_MEDIA_ROW_HEIGHT;
  }
}

function StickyTimelineHeader({ header }: { header: GridStickyHeader }) {
  const labels = [header.yearLabel, header.monthLabel].filter(
    (label): label is string => Boolean(label),
  );

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none sticky top-0 z-20 px-3 pt-3">
      <div className="inline-flex max-w-full flex-col gap-1 rounded-xl border border-border/80 bg-background/92 px-3 py-2 shadow-lg backdrop-blur-sm">
        {labels.map((label, index) => (
          <span
            key={`${header.variant}-${label}`}
            className={cn(
              "truncate leading-none",
              index === 0
                ? "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                : "text-sm font-semibold text-foreground",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Grid({ rows, onItemSelect }: GridProps) {
  const { t, resolvedLocale } = useI18n();
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => estimateRowHeight(rows[index]),
    overscan: 6,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const activeStickyHeader = useMemo(() => {
    if (rows.length === 0) {
      return null;
    }

    const targetOffset = scrollTop + 1;
    const topVisibleRow =
      virtualRows.find((virtualRow) => virtualRow.end > targetOffset) ?? virtualRows[0] ?? null;

    const candidateIndex = topVisibleRow?.index ?? 0;
    const candidateRow = rows[candidateIndex];
    if (!candidateRow) {
      return null;
    }

    if (candidateRow.stickyHeader.monthLabel) {
      return candidateRow.stickyHeader;
    }

    const nextRow = rows[candidateIndex + 1];
    if (
      nextRow &&
      nextRow.stickyHeader.variant === candidateRow.stickyHeader.variant &&
      nextRow.stickyHeader.yearLabel === candidateRow.stickyHeader.yearLabel &&
      nextRow.stickyHeader.monthLabel
    ) {
      return nextRow.stickyHeader;
    }

    return candidateRow.stickyHeader;
  }, [rows, scrollTop, virtualRows]);

  return (
    <Tooltip.Provider delayDuration={400}>
      <div
        ref={parentRef}
        className="relative h-full min-h-80 overflow-auto rounded-md border border-border"
        onScroll={(event) => {
          setScrollTop(event.currentTarget.scrollTop);
        }}
      >
        {activeStickyHeader ? <StickyTimelineHeader header={activeStickyHeader} /> : null}
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) {
              return null;
            }

            if (row.kind !== "media") {
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute left-0 top-0 w-full px-3 py-2"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div
                    className={cn(
                      "rounded-xl border px-4 py-3 shadow-xs",
                      row.kind === "year"
                        ? "border-border/80 bg-muted/60"
                        : "border-border/60 bg-background/80",
                    )}
                  >
                    <span
                      className={cn(
                        "block truncate",
                        row.kind === "year"
                          ? "text-sm font-semibold uppercase tracking-[0.2em] text-foreground"
                          : "text-sm font-medium text-muted-foreground",
                      )}
                    >
                      {row.label}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="absolute left-0 top-0 grid w-full grid-cols-2 gap-2 p-2 sm:grid-cols-4"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.items.map((item) => {
                  const shortDate = formatViewerShortDate(item.dateTaken, resolvedLocale);
                  const fullDate = formatViewerFullDate(item.dateTaken, resolvedLocale);

                  const typeLabel =
                    item.mediaKind === "video"
                      ? t("viewer.metadata.type.video")
                      : t("viewer.metadata.type.image");

                  return (
                    <Tooltip.Root key={item.id}>
                      <Tooltip.Trigger asChild>
                        <div className="relative aspect-9/16 overflow-hidden rounded-md border border-border bg-background">
                          {item.src ? (
                            <button
                              type="button"
                              className="block h-full w-full"
                              onClick={() => onItemSelect?.(item.mediaIndex)}
                              aria-label={t("viewer.grid.openMedia", { id: item.id })}
                              id={`viewer-thumb-${item.id}`}
                            >
                              <img
                                src={item.src}
                                alt={t("viewer.grid.thumbnailAlt", { id: item.id })}
                                loading="lazy"
                                className="block h-full w-full bg-background object-contain"
                                onError={() => {
                                  console.error("[viewer] Thumbnail failed to load", {
                                    id: item.id,
                                    src: item.src,
                                  });
                                }}
                              />
                            </button>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              {item.id}
                            </div>
                          )}
                          {item.src ? (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/50 to-transparent px-2 pb-1.5 pt-6">
                              {item.mediaKind === "video" ? (
                                <Film className="h-4 w-4 shrink-0 text-white/80" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                              ) : (
                                <ImageIcon className="h-4 w-4 shrink-0 text-white/80" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                              )}
                              {shortDate ? (
                                <span
                                  className="truncate pl-1 text-[10px] leading-none tabular-nums text-white/80"
                                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                                >
                                  {shortDate}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          sideOffset={6}
                          className="z-200 max-w-50 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground shadow-md"
                        >
                          <div className="space-y-1">
                            <div className="flex gap-1.5">
                              <span className="text-muted-foreground">{t("viewer.grid.tooltip.date")}:</span>
                              <span>{fullDate}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <span className="text-muted-foreground">{t("viewer.grid.tooltip.type")}:</span>
                              <span>{typeLabel}</span>
                            </div>
                            {item.location ? (
                              <div className="flex gap-1.5">
                                <span className="text-muted-foreground">{t("viewer.grid.tooltip.location")}:</span>
                                <span>{item.location}</span>
                              </div>
                            ) : null}
                          </div>
                          <Tooltip.Arrow className="fill-background" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
