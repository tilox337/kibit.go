import { API_URL } from "./api";
import type { Place } from "../types/search";

// Поиск выполняет локальный Go API; Nominatim вызывается на backend.
export const SEARCH_URL = `${API_URL}/api/v1/search/places`;
export const SEARCH_RESULTS_LIMIT = 8;

// Остальные методы (бэк пока не готов, в api/searchApi.ts стоят заглушки)
export const HISTORY_URL = `${API_URL}/trips/history`;
export const RECOMMENDATIONS_URL = `${API_URL}/places/recommendations`;
export const FAVORITES_URL = `${API_URL}/favorites`;

// Ключи localStorage, где заглушки хранят данные вместо сервера
export const FAVORITES_STORAGE_KEY = "stub-favorites";
export const HISTORY_STORAGE_KEY = "stub-trip-history";

// Поиск начинается после паузы в наборе и от такой длины запроса
export const SEARCH_DEBOUNCE_MS = 1000;
export const SEARCH_MIN_LENGTH = 3;

// Сколько последних поездок хранить в истории
export const MAX_HISTORY_ITEMS = 5;

// Приближение карты, когда выбрали пункт назначения
export const DESTINATION_ZOOM = 16;

// ---------- Данные для заглушек ----------

export const STUB_PLACES: Place[] = [
  { id: "p1", name: "Площадь Победы", address: "Минск, пр-т Независимости", lat: 53.9089, lng: 27.5751 },
  { id: "p2", name: "Национальная библиотека", address: "Минск, пр-т Независимости, 116", lat: 53.9314, lng: 27.6429 },
  { id: "p3", name: "Парк Горького", address: "Минск, ул. Янки Купалы", lat: 53.9025, lng: 27.5766 },
  { id: "p4", name: "Минск-Арена", address: "Минск, пр-т Победителей, 111", lat: 53.9381, lng: 27.4817 },
  { id: "p5", name: "Вокзал Минск-Пассажирский", address: "Минск, пл. Привокзальная", lat: 53.8909, lng: 27.5511 },
  { id: "p6", name: "Комаровский рынок", address: "Минск, ул. Нёманская, 2", lat: 53.9078, lng: 27.5714 },
];

export const STUB_RECOMMENDED_IDS = ["p3", "p4", "p5"];
