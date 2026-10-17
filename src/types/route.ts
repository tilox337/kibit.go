// Точка на карте
export interface LatLng {
  lat: number;
  lng: number;
}

// Построенный маршрут
export interface Route {
  points: [number, number][]; // линия маршрута: [широта, долгота]
  distanceMeters: number;
  durationSeconds: number;
}

// Что делает клик по карте
export type MapMode = "idle" | "light" | "origin";
