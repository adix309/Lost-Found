"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getLocaleFromPathname,
  localizePath,
  localeCookieName,
  type Locale,
} from "@/i18n/config";
import { messages, type Messages } from "@/i18n/messages";

type TranslationKey = keyof Messages | `${keyof Messages & string}.${string}`;

type I18nContextValue = {
  locale: Locale;
  t: (key: TranslationKey, fallback?: string) => string;
  localizeHref: (href: string, nextLocale?: Locale) => string;
  setLocale: (locale: Locale) => void;
  formatDateTime: (value?: string | Date | null) => string;
  formatDate: (value?: string | Date | null) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getNestedMessage(source: unknown, key: string): string | undefined {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source) as string | undefined;
}

function formatDateValue(
  locale: Locale,
  value?: string | Date | null,
  mode: "date" | "datetime" = "datetime",
) {
  if (!value) {
    return messages[locale].dates.notProvided;
  }

  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  const formatterLocale = locale === "en" ? "en-US" : locale === "bs" ? "bs-BA" : locale;
  const dateOptions: Intl.DateTimeFormatOptions =
    locale === "en"
      ? { month: "2-digit", day: "2-digit", year: "numeric" }
      : { day: "2-digit", month: "2-digit", year: "numeric" };

  const timeOptions: Intl.DateTimeFormatOptions =
    locale === "en"
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : { hour: "2-digit", minute: "2-digit", hour12: false };

  const date = new Intl.DateTimeFormat(formatterLocale, dateOptions).format(parsed);

  if (mode === "date") {
    return locale === "en" ? date : `${date.replace(/\//g, ".")}.`;
  }

  const time = new Intl.DateTimeFormat(formatterLocale, timeOptions).format(parsed);
  return locale === "en" ? `${date} ${time}` : `${date.replace(/\//g, ".")}. ${time}`;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const activeMessages = messages[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const localizeHref = (href: string, nextLocale = locale) => {
      if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return href;
      }

      return localizePath(href, nextLocale);
    };

    return {
      locale,
      t: (key, fallback) => getNestedMessage(activeMessages, key) || fallback || key,
      localizeHref,
      setLocale: (nextLocale) => {
        document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
        localStorage.setItem(localeCookieName, nextLocale);
        router.push(localizePath(pathname, nextLocale));
      },
      formatDateTime: (valueToFormat) => formatDateValue(locale, valueToFormat, "datetime"),
      formatDate: (valueToFormat) => formatDateValue(locale, valueToFormat, "date"),
    };
  }, [activeMessages, locale, pathname, router]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
