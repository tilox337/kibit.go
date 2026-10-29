import { API_URL } from "../constants/api";
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

// Маршрут от точки from до точки to. Go пока отдаёт прямую, не путь по дорогам.
export async function fetchRoute(
  from: LatLng,
  to: LatLng,
  _options: RouteOptions = {},
): Promise<Route> {
  const response = await fetch(`${API_URL}/api/v1/routes`, {
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
