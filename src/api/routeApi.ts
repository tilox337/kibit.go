import { ROUTE_URL } from "../constants/route";
import type { LatLng, Route } from "../types/route";

// Ответ OSRM (только то, что нам нужно)
interface OsrmResponse {
  code: string;
  routes?: {
    distance: number; // метры
    duration: number; // секунды
    geometry: { coordinates: [number, number][] }; // [долгота, широта]
  }[];
}

// Адрес запроса. В OSRM координаты идут как «долгота,широта», через «;»
export function buildRouteUrl(from: LatLng, to: LatLng): string {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  return `${ROUTE_URL}/${coords}?overview=full&geometries=geojson`;
}

// Маршрут по дорогам от точки from до точки to
export async function fetchRoute(from: LatLng, to: LatLng): Promise<Route> {
  const url = buildRouteUrl(from, to);
  console.log(`GET ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Сервис маршрутов ответил ${response.status}`);
  }

  const data = (await response.json()) as OsrmResponse;
  const best = data.routes?.[0];
  if (data.code !== "Ok" || !best) {
    throw new Error(`Маршрут не найден (${data.code})`);
  }

  return {
    // Leaflet ждёт [широта, долгота], а OSRM отдаёт наоборот
    points: best.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: best.distance,
    durationSeconds: best.duration,
  };
}
