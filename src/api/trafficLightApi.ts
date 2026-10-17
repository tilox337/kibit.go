import {
  API_URL,
  STUB_STORAGE_KEY,
  TRAFFIC_LIGHTS_ENDPOINT,
} from "../constants/api";
import type { TrafficLightPoint } from "../types/trafficLight";
import { readStorage, writeStorage } from "../utils/storage";

const TRAFFIC_LIGHTS_URL = `${API_URL}${TRAFFIC_LIGHTS_ENDPOINT}`;

export interface OSMTrafficSignal {
  id: string;
  lat: number;
  lng: number;
}

export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

// OSM-сигналы загружаются через API; ручные светофоры пока хранятся в localStorage.

export async function fetchOSMTrafficSignals(
  bounds: MapBounds,
  signal?: AbortSignal,
): Promise<OSMTrafficSignal[]> {
  const query = new URLSearchParams({
    west: String(bounds.west),
    south: String(bounds.south),
    east: String(bounds.east),
    north: String(bounds.north),
  });
  const response = await fetch(`/api/osm-traffic-lights?${query}`, { signal });
  if (!response.ok) {
    throw new Error(`Загрузка OSM-светофоров завершилась с HTTP ${response.status}`);
  }
  return (await response.json()) as OSMTrafficSignal[];
}

// Потом здесь будет fetch: GET {TRAFFIC_LIGHTS_URL} -> TrafficLightPoint[]
export async function fetchTrafficLights(): Promise<TrafficLightPoint[]> {
  console.log(`[stub] GET ${TRAFFIC_LIGHTS_URL}`);
  return readStorage<TrafficLightPoint[]>(STUB_STORAGE_KEY, []);
}

// Потом здесь будет fetch: DELETE {TRAFFIC_LIGHTS_URL}/{id}
export async function deleteTrafficLight(id: string): Promise<void> {
  console.log(`[stub] DELETE ${TRAFFIC_LIGHTS_URL}/${id}`);
  const stored = readStorage<TrafficLightPoint[]>(STUB_STORAGE_KEY, []);
  writeStorage(
    STUB_STORAGE_KEY,
    stored.filter((light) => light.id !== id),
  );
}

// Потом здесь будет fetch: POST {TRAFFIC_LIGHTS_URL} с телом TrafficLightPoint
export async function createTrafficLight(
  light: TrafficLightPoint,
): Promise<void> {
  console.log(`[stub] POST ${TRAFFIC_LIGHTS_URL}`, light);
  const stored = readStorage<TrafficLightPoint[]>(STUB_STORAGE_KEY, []);
  writeStorage(STUB_STORAGE_KEY, [...stored, light]);
}
