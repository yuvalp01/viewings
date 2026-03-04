/**
 * Column configuration for the viewings table.
 * Used for show/hide and reorder; persisted in sessionStorage.
 */

export interface ColumnConfigItem {
  id: string;
  label: string;
  visible: boolean;
}

export const VIEWINGS_TABLE_COLUMNS_KEY = "viewings-table-columns";

/** Columns that appear in the column picker (menu is always visible and fixed last). */
export const DEFAULT_COLUMNS: ColumnConfigItem[] = [
  { id: "id", label: "ID", visible: false },
  { id: "address", label: "Address", visible: true },
  { id: "ad", label: "Ad", visible: true },
  { id: "photos", label: "Photos", visible: true },
  { id: "size", label: "Size", visible: true },
  { id: "price", label: "Price", visible: true },
  { id: "pricePerM", label: "€/m²", visible: true },
  { id: "bedrooms", label: "Beds", visible: false },
  { id: "floor", label: "Floor", visible: true },
  { id: "rent", label: "Rent", visible: true },
  { id: "extra", label: "Extra", visible: true },
  { id: "priceExtra", label: "Price Extra", visible: true },
  { id: "eurPerSqmEx", label: "€/m²Ex", visible: true },
  { id: "totalCost", label: "Total Cost", visible: true },
  { id: "agent", label: "Agent", visible: false },
  { id: "outcome", label: "Outcome", visible: true },
  { id: "comments", label: "Comments", visible: true },
  { id: "visit", label: "Visit", visible: true },
  { id: "schedule", label: "Schedule", visible: false },
];

/** Menu column is always visible and not configurable. */
export const MENU_COLUMN_ID = "menu";

export function loadColumnConfig(): ColumnConfigItem[] {
  if (typeof window === "undefined") return DEFAULT_COLUMNS;
  try {
    const raw = sessionStorage.getItem(VIEWINGS_TABLE_COLUMNS_KEY);
    if (!raw) return DEFAULT_COLUMNS;
    const parsed = JSON.parse(raw) as { columns?: ColumnConfigItem[] };
    if (!Array.isArray(parsed?.columns) || parsed.columns.length === 0) {
      return DEFAULT_COLUMNS;
    }
    const validIds = new Set(DEFAULT_COLUMNS.map((c) => c.id));
    const restored = parsed.columns.filter((c) => validIds.has(c.id));
    const missing = DEFAULT_COLUMNS.filter((c) => !restored.some((r) => r.id === c.id));
    const merged = [...restored];
    missing.forEach((c) => merged.push({ ...c }));
    return merged;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

export function saveColumnConfig(columns: ColumnConfigItem[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      VIEWINGS_TABLE_COLUMNS_KEY,
      JSON.stringify({ columns })
    );
  } catch {
    // ignore
  }
}
