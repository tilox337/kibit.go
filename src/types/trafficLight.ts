export type TrafficLightColor = "red" | "yellow" | "green";

// Настройки светофора (всё в секундах, кроме startHour)
export interface TrafficLightConfig {
  redSeconds: number;
  greenSeconds: number; // включая моргающий зелёный в конце
  startHour: number; // час начала работы, 0-23
  phaseOffsetSeconds?: number;
}

// Одна фаза цикла: цвет + сколько длится
export interface TrafficLightPhase {
  color: TrafficLightColor;
  duration: number;
}

// То, что показываем во всплывашке
export interface TrafficLightState {
  isWorking: boolean;
  color: TrafficLightColor | null;
  secondsLeft: number | null; // для выключенного светофора — null
  isFlashing: boolean; // моргающий зелёный
}

// Светофор, поставленный на карту
export interface TrafficLightPoint extends TrafficLightConfig {
  id: string;
  lat: number;
  lng: number;
}
