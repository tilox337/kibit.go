// Безопасное чтение из localStorage (в приватном режиме или при битых данных вернёт fallback)
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.error(`[stub] Не удалось прочитать ${key} из localStorage`, error);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[stub] Не удалось записать ${key} в localStorage`, error);
  }
}
