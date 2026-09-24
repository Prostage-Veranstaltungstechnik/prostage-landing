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
  visible: boolean;
  sortOrder: number;
  image: string | null;
  isSet: boolean;
  setItems: ProductSetItem[];
}

export interface ProductSetItem {
  productId: string;
  quantity: number;
  productName?: string;
}

export const CATEGORY_OPTIONS = [
  { key: "ton", label: "Tontechnik" },
  { key: "licht", label: "Lichttechnik" },
  { key: "sfx", label: "SFX" },
  { key: "netzwerk", label: "Netzwerktechnik" },
  { key: "buehne-kabel", label: "Bühne & Kabel" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  ton: "Tontechnik",
  licht: "Lichttechnik",
  sfx: "SFX",
  netzwerk: "Netzwerktechnik",
  "buehne-kabel": "Bühne & Kabel",
};

export const AVAILABILITY_OPTIONS = [
  "Verfügbar",
  "Auf Anfrage",
  "Nicht verfügbar",
] as const;
