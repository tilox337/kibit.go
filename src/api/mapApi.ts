import { API_URL } from "../constants/api";

export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface MapFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSON.Feature[];
}

// Объекты карты из Go. Координаты в GeoJSON: [lon, lat].
export async function fetchMapFeatures(
  bounds: MapBounds,
  signal?: AbortSignal,
): Promise<MapFeatureCollection> {
  const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].join(",");
  const query = new URLSearchParams({
    bbox,
    layers: "buildings,trees,roads",
  });
  const response = await fetch(`${API_URL}/api/v1/map/features?${query}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Объекты карты ответили ${response.status}`);
  }
  return (await response.json()) as MapFeatureCollection;
}
