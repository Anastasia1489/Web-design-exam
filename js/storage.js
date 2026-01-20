const STORAGE_KEY = "portfolio-filters-v1";

export function loadFilters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { directions: [], difficulty: null };
    const parsed = JSON.parse(raw);
    return {
      directions: Array.isArray(parsed.directions) ? parsed.directions : [],
      difficulty: parsed.difficulty || null
    };
  } catch {
    return { directions: [], difficulty: null };
  }
}

export function saveFilters(filters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // localStorage может быть недоступен — просто молча игнорируем
  }
}

