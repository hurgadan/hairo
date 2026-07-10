import { Maintenance } from "../../_contracts/catalog/enums";

// data/hairstyles.seed.json лежит в корне репозитория; сидер запускается из api/ (cwd),
// поэтому путь относительно cwd — на уровень выше.
export const SEED_FILE_RELATIVE_PATH = "../data/hairstyles.seed.json";

export const CATALOG_TABLES = {
  hairstyles: "hairstyles",
  colorOptions: "color_options",
} as const;

// Порядок потолка готовности к уходу для hard-фильтра (CATALOG.md §5).
export const MAINTENANCE_ORDER = [
  Maintenance.Low,
  Maintenance.Medium,
  Maintenance.High,
];
