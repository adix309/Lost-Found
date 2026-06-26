export const categoryKeys = [
  "documents",
  "electronics",
  "clothing",
  "keys",
  "wallet",
  "bags",
  "pets",
  "other",
] as const;

export type CategoryKey = (typeof categoryKeys)[number];

export const legacyCategoryToKey: Record<string, CategoryKey> = {
  Dokumenti: "documents",
  Documents: "documents",
  Documentos: "documents",
  Dokumente: "documents",
  Elektronika: "electronics",
  Electronics: "electronics",
  Elektronik: "electronics",
  Clothing: "clothing",
  Ropa: "clothing",
  Kleidung: "clothing",
  Keys: "keys",
  Llaves: "keys",
  Wallet: "wallet",
  Cartera: "wallet",
  Torbe: "bags",
  Bags: "bags",
  Bolsos: "bags",
  Taschen: "bags",
  Pets: "pets",
  Mascotas: "pets",
  Haustiere: "pets",
  Ostalo: "other",
  Other: "other",
  Otro: "other",
  Sonstiges: "other",
};

export function normalizeCategoryKey(category: string | null | undefined): CategoryKey | string {
  if (!category) {
    return "other";
  }

  return legacyCategoryToKey[category] || category;
}
