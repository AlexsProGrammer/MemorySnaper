import type { ResolvedLocale } from "@/lib/language";
import { messagesByLocale, type TranslationKey } from "@/lib/i18n-messages";

const ENGLISH_ALIAS_TO_CODE: Record<string, string> = {
  "bosnia and herzegovina": "BA",
  "cape verde": "CV",
  "czechia": "CZ",
  "dr congo": "CD",
  "ivory coast": "CI",
  "north macedonia": "MK",
  "s sweden": "SE",
  "s sudan": "SS",
  "swaziland": "SZ",
  "timor leste": "TL",
  "u s virgin islands": "VI",
  "vatican": "VA",
};

const COUNTRY_NAME_LOCALES = ["en", "de", "fr", "es", "it", "pl", "nl", "pt", "pt-PT", "pt-BR"];

let countryNameToCodeCache: Map<string, string> | null = null;

const COUNTRY_CODE_TO_I18N_KEY = {
  AR: "countries.AR",
  AU: "countries.AU",
  BR: "countries.BR",
  CA: "countries.CA",
  CN: "countries.CN",
  DE: "countries.DE",
  ES: "countries.ES",
  FR: "countries.FR",
  GB: "countries.GB",
  IN: "countries.IN",
  IT: "countries.IT",
  JP: "countries.JP",
  KR: "countries.KR",
  MX: "countries.MX",
  NL: "countries.NL",
  NZ: "countries.NZ",
  PL: "countries.PL",
  PT: "countries.PT",
  RU: "countries.RU",
  TR: "countries.TR",
  UA: "countries.UA",
  US: "countries.US",
  ZA: "countries.ZA",
} as const satisfies Record<string, TranslationKey>;

function normalizeCountryKey(value: string): string {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function getRegionCodes(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("region");
    } catch {
      // Fallback below.
    }
  }

  // Build a broad fallback set from alpha-2 combinations if supportedValuesOf is unavailable.
  const display = new Intl.DisplayNames(["en"], { type: "region" });
  const codes: string[] = [];

  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first, second);
      const name = display.of(code);

      // Ignore unknown/synthetic entries that resolve back to the code itself.
      if (name && name !== code) {
        codes.push(code);
      }
    }
  }

  return codes;
}

function getCountryNameToCode(): Map<string, string> {
  if (countryNameToCodeCache) {
    return countryNameToCodeCache;
  }

  const map = new Map<string, string>();

  for (const code of getRegionCodes()) {
    for (const locale of COUNTRY_NAME_LOCALES) {
      const localizedName = new Intl.DisplayNames([locale], { type: "region" }).of(code);
      if (!localizedName) {
        continue;
      }

      map.set(normalizeCountryKey(localizedName), code);
    }
  }

  for (const [alias, code] of Object.entries(ENGLISH_ALIAS_TO_CODE)) {
    map.set(alias, code);
  }

  countryNameToCodeCache = map;
  return map;
}

function countryCodeFromInput(countryName: string): string | null {
  const trimmed = countryName.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const key = normalizeCountryKey(countryName);
  return getCountryNameToCode().get(key) ?? null;
}

export function localizeCountryName(countryName: string, locale: ResolvedLocale): string {
  const code = countryCodeFromInput(countryName);

  if (!code) {
    return countryName;
  }

  const i18nKey = COUNTRY_CODE_TO_I18N_KEY[code as keyof typeof COUNTRY_CODE_TO_I18N_KEY];
  if (i18nKey) {
    const fromI18n = messagesByLocale[locale][i18nKey];
    if (fromI18n) {
      return fromI18n;
    }
  }

  const localized = new Intl.DisplayNames([locale], { type: "region" }).of(code);
  return localized ?? countryName;
}
