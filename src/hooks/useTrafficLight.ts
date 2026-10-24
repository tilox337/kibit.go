import { useEffect, useState } from "react";
import {
  createTrafficLight,
  deleteTrafficLight,
  fetchTrafficLights,
} from "../api/trafficLightApi";
import {
  DEFAULT_GREEN_SECONDS,
  DEFAULT_RED_SECONDS,
  TICK_INTERVAL_MS,
  YELLOW_SECONDS,
} from "../constants/trafficLight";
import type {
  TrafficLightConfig,
  TrafficLightPoint,
  TrafficLightState,
} from "../types/trafficLight";
import {
  calcTrafficLightState,
  createTrafficLightPoint,
  getPhaseOffsetSeconds,
  getSecondsOfDay,
} from "../utils/trafficLight";

// Текущее время в секундах с начала суток, обновляется по таймеру
export function useNowSeconds(intervalMs: number = TICK_INTERVAL_MS): number {
  const [nowSeconds, setNowSeconds] = useState(() =>
    getSecondsOfDay(new Date()),
  );

  useEffect(() => {
    const id = setInterval(
      () => setNowSeconds(getSecondsOfDay(new Date())),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [intervalMs]);

  return nowSeconds;
}

// Текущее состояние светофора по его настройкам
export function useTrafficLight(config: TrafficLightConfig): TrafficLightState {
  const nowSeconds = useNowSeconds();
  return calcTrafficLightState(config, nowSeconds);
}

// Список светофоров на карте: загрузка с сервера и добавление нового
export function useTrafficLights() {
  const [lights, setLights] = useState<TrafficLightPoint[]>([]);

  useEffect(() => {
    let isCancelled = false;

    fetchTrafficLights()
      .then((loaded) => {
        // Если пользователь уже успел поставить светофор, не затираем его
        if (!isCancelled) setLights((current) => [...loaded, ...current]);
      })
      .catch((error) =>
        console.error("Не удалось загрузить светофоры", error),
      );

    return () => {
      isCancelled = true;
    };
  }, []);

  const addLight = (lat: number, lng: number): TrafficLightPoint => {
    const cycleLength =
      DEFAULT_RED_SECONDS + DEFAULT_GREEN_SECONDS + YELLOW_SECONDS;
    const usedOffsets = new Set(
      lights.map(
        (light) =>
          light.phaseOffsetSeconds ??
          getPhaseOffsetSeconds(
            light.id,
            light.redSeconds + light.greenSeconds + YELLOW_SECONDS,
          ),
      ),
    );
    let phaseOffsetSeconds = (lights.length * 11) % cycleLength;
    for (let attempt = 0; usedOffsets.has(phaseOffsetSeconds) && attempt < cycleLength; attempt++) {
      phaseOffsetSeconds = (phaseOffsetSeconds + 1) % cycleLength;
    }

    const light = createTrafficLightPoint(lat, lng, phaseOffsetSeconds);
    setLights((current) => [...current, light]);
    createTrafficLight(light).catch((error) =>
      console.error("Не удалось сохранить светофор", error),
    );
    return light;
  };

  const removeLight = (id: string) => {
    setLights((current) => current.filter((light) => light.id !== id));
    deleteTrafficLight(id).catch((error) =>
      console.error("Не удалось удалить светофор", error),
    );
  };

  return { lights, addLight, removeLight };
}
