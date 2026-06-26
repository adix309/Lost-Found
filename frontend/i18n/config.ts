export const locales = ["bs", "en", "es", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bs";
export const localeCookieName = "lost_found_locale";

export const localeLabels: Record<Locale, string> = {
  bs: "Bosanski",
  en: "English",
  es: "Español",
  de: "Deutsch",
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : defaultLocale;
}

export function stripLocaleFromPathname(pathname: string) {
  const segments = pathname.split("/");
  return isLocale(segments[1]) ? `/${segments.slice(2).join("/")}` || "/" : pathname;
}

export function localizePath(pathname: string, locale: Locale) {
  const pathWithoutLocale = stripLocaleFromPathname(pathname);
  return pathWithoutLocale === "/" ? `/${locale}` : `/${locale}${pathWithoutLocale}`;
}

export function getPreferredLocale(acceptLanguage: string | null, cookieLocale?: string) {
  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const requestedLocales = (acceptLanguage || "")
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.toLowerCase().split("-")[0])
    .filter(Boolean);

  return requestedLocales.find(isLocale) || defaultLocale;
}
