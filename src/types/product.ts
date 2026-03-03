export interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  price: string;
  unit: string;
  specs: Record<string, string>;
  availability: string;
  featured: boolean;
  sortOrder: number;
  image: string | null;
}

export const CATEGORY_OPTIONS = [
  { key: "ton", label: "Tontechnik" },
  { key: "licht", label: "Lichttechnik" },
  { key: "vermietung", label: "Vermietung" },
  { key: "fullservice", label: "Full Service" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  ton: "Tontechnik",
  licht: "Lichttechnik",
  vermietung: "Vermietung",
  fullservice: "Full Service",
};

export const AVAILABILITY_OPTIONS = [
  "Verfügbar",
  "Auf Anfrage",
  "Nicht verfügbar",
] as const;
