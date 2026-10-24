import type { TrafficLightColor } from "../types/trafficLight";

// Жёлтый по ГОСТу — 3 секунды. Горит после зелёного, перед красным
export const YELLOW_SECONDS = 3;

// Сколько последних секунд зелёного он моргает (моргание относится к зелёному)
export const GREEN_FLASH_SECONDS = 3;

// Во сколько (час, 0-23) начинается работа светофора по умолчанию
export const DEFAULT_START_HOUR = 5;

// Значения для нового светофора, пока их не задаёт сервер
export const DEFAULT_RED_SECONDS = 30;
export const DEFAULT_GREEN_SECONDS = 20;

// Как часто проверяем время (мс)
export const TICK_INTERVAL_MS = 1000;

export const SECONDS_IN_HOUR = 60 * 60;

export const COLOR_LABELS: Record<TrafficLightColor, string> = {
  red: "Красный",
  yellow: "Жёлтый",
  green: "Зелёный",
};
