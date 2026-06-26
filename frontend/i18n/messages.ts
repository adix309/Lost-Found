import bs from "@/messages/bs.json";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import type { Locale } from "@/i18n/config";

export type Messages = typeof bs;

export const messages: Record<Locale, Messages> = {
  bs,
  en,
  es,
  de,
};
