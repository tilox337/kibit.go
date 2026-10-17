import {
  FAVORITES_STORAGE_KEY,
  FAVORITES_URL,
  HISTORY_STORAGE_KEY,
  HISTORY_URL,
  MAX_HISTORY_ITEMS,
  RECOMMENDATIONS_URL,
  SEARCH_LANGUAGE,
  SEARCH_RESULTS_LIMIT,
  SEARCH_URL,
  STUB_PLACES,
  STUB_RECOMMENDED_IDS,
} from "../constants/search";
import type { Place, TripRecord } from "../types/search";
import { readStorage, writeStorage } from "../utils/storage";

// Ответ Nominatim (только то, что нам нужно). Координаты приходят строками
interface NominatimItem {
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
}

// Адрес запроса поиска
export function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: String(SEARCH_RESULTS_LIMIT),
    "accept-language": SEARCH_LANGUAGE,
  });
  return `${SEARCH_URL}?${params.toString()}`;
}

// Nominatim -> наше место. Название — первая часть адреса, если своего имени нет
export function nominatimToPlace(item: NominatimItem): Place {
  return {
    id: `${item.osm_type}-${item.osm_id}`,
    name: item.name || item.display_name.split(",")[0].trim(),
    address: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  };
}

// Поиск настоящих адресов и мест
export async function searchPlaces(query: string): Promise<Place[]> {
  const url = buildSearchUrl(query);
  console.log(`GET ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Сервис поиска ответил ${response.status}`);
  }

  const items = (await response.json()) as NominatimItem[];
  return items.map(nominatimToPlace);
}

// Функции ниже ЗАГЛУШКИ: пишут в консоль и работают с localStorage.
// Когда появится бэк, в каждой заменить тело на fetch по адресу из комментария.

// GET {RECOMMENDATIONS_URL} -> Place[]
export async function fetchRecommendations(): Promise<Place[]> {
  console.log(`[stub] GET ${RECOMMENDATIONS_URL}`);
  return STUB_PLACES.filter((place) => STUB_RECOMMENDED_IDS.includes(place.id));
}

// GET {HISTORY_URL} -> TripRecord[] (новые первыми)
export async function fetchTripHistory(): Promise<TripRecord[]> {
  console.log(`[stub] GET ${HISTORY_URL}`);
  return readStorage<TripRecord[]>(HISTORY_STORAGE_KEY, []);
}

// POST {HISTORY_URL} с телом Place
export async function addTripToHistory(place: Place): Promise<TripRecord[]> {
  console.log(`[stub] POST ${HISTORY_URL}`, place);
  const record: TripRecord = {
    id: `${place.id}-${Date.now()}`,
    place,
    timestamp: Date.now(),
  };
  const others = readStorage<TripRecord[]>(HISTORY_STORAGE_KEY, []).filter(
    (item) => item.place.id !== place.id,
  );
  const updated = [record, ...others].slice(0, MAX_HISTORY_ITEMS);
  writeStorage(HISTORY_STORAGE_KEY, updated);
  return updated;
}

// GET {FAVORITES_URL} -> Place[]
export async function fetchFavorites(): Promise<Place[]> {
  console.log(`[stub] GET ${FAVORITES_URL}`);
  return readStorage<Place[]>(FAVORITES_STORAGE_KEY, []);
}

// POST {FAVORITES_URL} с телом Place
export async function addFavorite(place: Place): Promise<void> {
  console.log(`[stub] POST ${FAVORITES_URL}`, place);
  const others = readStorage<Place[]>(FAVORITES_STORAGE_KEY, []).filter(
    (item) => item.id !== place.id,
  );
  writeStorage(FAVORITES_STORAGE_KEY, [...others, place]);
}

// DELETE {FAVORITES_URL}/{placeId}
export async function removeFavorite(placeId: string): Promise<void> {
  console.log(`[stub] DELETE ${FAVORITES_URL}/${placeId}`);
  const rest = readStorage<Place[]>(FAVORITES_STORAGE_KEY, []).filter(
    (item) => item.id !== placeId,
  );
  writeStorage(FAVORITES_STORAGE_KEY, rest);
}
