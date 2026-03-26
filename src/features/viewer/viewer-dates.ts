import type { ResolvedLocale } from "@/lib/language";

type YearMonthParts = {
  year: number;
  month: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(
  locale: ResolvedLocale,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${JSON.stringify(options)}`;
  const cachedFormatter = formatterCache.get(cacheKey);
  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(locale, options);
  formatterCache.set(cacheKey, formatter);
  return formatter;
}

export function parseViewerDate(dateTaken: string): Date | null {
  const parsedDate = new Date(dateTaken);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function getViewerYearMonth(dateTaken: string): YearMonthParts | null {
  const match = /^(\d{4})-(\d{2})(?:-\d{2})?/.exec(dateTaken);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);

    if (month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  const parsedDate = parseViewerDate(dateTaken);
  if (!parsedDate) {
    return null;
  }

  return {
    year: parsedDate.getUTCFullYear(),
    month: parsedDate.getUTCMonth() + 1,
  };
}

export function formatViewerShortDate(dateTaken: string, locale: ResolvedLocale): string {
  const parsedDate = parseViewerDate(dateTaken);
  if (!parsedDate) {
    return "";
  }

  return getFormatter(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

export function formatViewerFullDate(dateTaken: string, locale: ResolvedLocale): string {
  const parsedDate = parseViewerDate(dateTaken);
  if (!parsedDate) {
    return dateTaken;
  }

  return getFormatter(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export function formatViewerMetadataDate(dateTaken: string, locale: ResolvedLocale): string {
  const parsedDate = parseViewerDate(dateTaken);
  if (!parsedDate) {
    return dateTaken;
  }

  return getFormatter(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

export function formatViewerMetadataTime(dateTaken: string, locale: ResolvedLocale): string {
  const parsedDate = parseViewerDate(dateTaken);
  if (!parsedDate) {
    return "—";
  }

  return getFormatter(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export function formatViewerMonthLabel(parts: YearMonthParts, locale: ResolvedLocale): string {
  const monthDate = new Date(Date.UTC(parts.year, parts.month - 1, 1));
  return getFormatter(locale, {
    month: "long",
    timeZone: "UTC",
  }).format(monthDate);
}

export function formatViewerYearLabel(parts: YearMonthParts): string {
  return String(parts.year);
}
