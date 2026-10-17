// Плитки OpenStreetMap.
// Для разработки подходит, для продакшена с большой нагрузкой нужен свой тайл-сервер
// или платный провайдер: https://operations.osmfoundation.org/policies/tiles/
export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Центр карты при открытии: Минск [широта, долгота]
export const MAP_DEFAULT_CENTER: [number, number] = [53.9006, 27.559];
export const MAP_DEFAULT_ZOOM = 13;
export const MAP_MAX_ZOOM = 19;
