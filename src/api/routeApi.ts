import { ROUTE_URL } from "../constants/route";
import type { LatLng, Route } from "../types/route";

interface RouteResponse {
  route: {
    distance_m: number;
    duration_s: number;
    geometry: { coordinates: [number, number][] };
  };
}

export interface RouteOptions {
  avoidTollRoads?: boolean;
}

// Локальный API принимает координаты и возвращает геометрию маршрута.
export async function fetchRoute(
  from: LatLng,
  to: LatLng,
  _options: RouteOptions = {},
): Promise<Route> {
  const response = await fetch(ROUTE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start: { lat: from.lat, lon: from.lng },
      end: { lat: to.lat, lon: to.lng },
      mode: "car",
    }),
  });
  if (!response.ok) {
    throw new Error(`Сервис маршрутов ответил ${response.status}`);
  }

  const data = (await response.json()) as RouteResponse;

  return {
    points: data.route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: data.route.distance_m,
    durationSeconds: data.route.duration_s,
  };
}
