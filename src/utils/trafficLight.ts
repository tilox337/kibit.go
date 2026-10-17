import {
  DEFAULT_GREEN_SECONDS,
  DEFAULT_RED_SECONDS,
  DEFAULT_START_HOUR,
  GREEN_FLASH_SECONDS,
  SECONDS_IN_HOUR,
  YELLOW_SECONDS,
} from "../constants/trafficLight";
import type {
  TrafficLightColor,
  TrafficLightConfig,
  TrafficLightPhase,
  TrafficLightPoint,
  TrafficLightState,
} from "../types/trafficLight";

// ---------- Время ----------

// Сколько секунд прошло с начала суток (с дробной частью)
export function getSecondsOfDay(date: Date): number {
  return (
    date.getHours() * SECONDS_IN_HOUR +
    date.getMinutes() * 60 +
    date.getSeconds() +
    date.getMilliseconds() / 1000
  );
}

// Сколько секунд прошло с момента старта светофора (отрицательное — ещё не начал работать)
export function getSecondsSinceStart(
  nowSeconds: number,
  startHour: number,
): number {
  return nowSeconds - startHour * SECONDS_IN_HOUR;
}

// ---------- Цикл ----------

// Цикл: красный -> зелёный -> жёлтый -> (снова красный)
export function buildPhases({
  redSeconds,
  greenSeconds,
}: Pick<TrafficLightConfig, "redSeconds" | "greenSeconds">): TrafficLightPhase[] {
  return [
    { color: "red", duration: redSeconds },
    { color: "green", duration: greenSeconds },
    { color: "yellow", duration: YELLOW_SECONDS },
  ];
}

export function getCycleLength(phases: TrafficLightPhase[]): number {
  return phases.reduce((sum, phase) => sum + phase.duration, 0);
}

// Находит фазу по смещению внутри цикла и сколько секунд она уже идёт
export function findPhaseAt(
  phases: TrafficLightPhase[],
  offset: number,
): { phase: TrafficLightPhase; elapsed: number } {
  let passed = 0;
  for (const phase of phases) {
    if (offset < passed + phase.duration) {
      return { phase, elapsed: offset - passed };
    }
    passed += phase.duration;
  }
  return { phase: phases[0], elapsed: 0 };
}

// ---------- Состояние ----------

const OFF_STATE: TrafficLightState = {
  isWorking: false,
  color: null,
  secondsLeft: null,
  isFlashing: false,
};

// Зелёный моргает в последние GREEN_FLASH_SECONDS секунд
function isGreenFlashing(
  color: TrafficLightColor,
  secondsLeft: number,
): boolean {
  return color === "green" && secondsLeft <= GREEN_FLASH_SECONDS;
}

// Для жёлтого время до переключения не показываем
function getDisplayedSecondsLeft(
  color: TrafficLightColor,
  secondsLeft: number,
): number | null {
  return color === "yellow" ? null : secondsLeft;
}

// Главная функция: какой цвет горит и сколько осталось в момент nowSeconds
export function calcTrafficLightState(
  config: TrafficLightConfig,
  nowSeconds: number,
): TrafficLightState {
  const sinceStart = getSecondsSinceStart(nowSeconds, config.startHour);
  if (sinceStart < 0) return OFF_STATE;

  const phases = buildPhases(config);
  const offset = sinceStart % getCycleLength(phases);
  const { phase, elapsed } = findPhaseAt(phases, offset);
  const secondsLeft = Math.ceil(phase.duration - elapsed);

  return {
    isWorking: true,
    color: phase.color,
    secondsLeft: getDisplayedSecondsLeft(phase.color, secondsLeft),
    isFlashing: isGreenFlashing(phase.color, secondsLeft),
  };
}

// ---------- Точки на карте ----------

// Временный id, пока сервер не выдаёт свои
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Новый светофор в точке карты с настройками по умолчанию
export function createTrafficLightPoint(
  lat: number,
  lng: number,
): TrafficLightPoint {
  return {
    id: generateId(),
    lat,
    lng,
    redSeconds: DEFAULT_RED_SECONDS,
    greenSeconds: DEFAULT_GREEN_SECONDS,
    startHour: DEFAULT_START_HOUR,
  };
}
