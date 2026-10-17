// Сервис маршрутов OSRM, профиль «на машине».
// Публичный демо-сервер подходит только для разработки: без гарантий и с ограничением запросов.
// Для продакшена нужен свой сервер OSRM или платный сервис (OpenRouteService, GraphHopper и т.п.)
export const ROUTE_URL = "https://router.project-osrm.org/route/v1/driving";

// Отступ от краёв экрана, когда карта вписывает маршрут целиком
export const ROUTE_FIT_PADDING = 80;
