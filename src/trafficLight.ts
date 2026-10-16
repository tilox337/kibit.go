export const YELLOW_SECONDS = 3;
const DAY_SECONDS = 24 * 60 * 60;

export type LightColor = "green" | "yellow" | "red";

/** То, что приходит с бэкенда. Жёлтый всегда 3 секунды и в ответе не нужен. */
export type TrafficLightSchedule = {
  redSeconds: number;
  greenSeconds: number;
  startsAtSeconds: number;
};

export type LightPhase = {
  color: LightColor;
  /** Seconds until the next color. Yellow has no countdown. */
  secondsLeft: number | null;
};

export function getTrafficLightPhase(now: Date, schedule: TrafficLightSchedule): LightPhase {
  const green = Math.max(0, schedule.greenSeconds);
  const red = Math.max(0, schedule.redSeconds);
  const startsAtSeconds = schedule.startsAtSeconds;
  const cycle = green + YELLOW_SECONDS + red + YELLOW_SECONDS;
  const secondsOfDay =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  const start = ((startsAtSeconds % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS;
  const elapsed = (secondsOfDay - start + DAY_SECONDS) % DAY_SECONDS;
  const position = elapsed % cycle;

  if (position < green) {
    return { color: "green", secondsLeft: green - position };
  }

  const afterGreenYellow = green + YELLOW_SECONDS;
  if (position < afterGreenYellow) {
    return { color: "yellow", secondsLeft: null };
  }

  const afterRed = afterGreenYellow + red;
  if (position < afterRed) {
    return { color: "red", secondsLeft: afterRed - position };
  }

  return { color: "yellow", secondsLeft: null };
}
