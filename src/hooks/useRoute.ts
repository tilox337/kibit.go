import { useEffect, useState } from "react";
import { fetchRoute, type RouteOptions } from "../api/routeApi";
import type { LatLng, Route } from "../types/route";
import type { Place } from "../types/search";

// Маршрут от точки «Я здесь» до выбранного места. Строится заново при смене любой из точек
export function useRoute(
  origin: LatLng | null,
  destination: Place | null,
  options: RouteOptions = {},
) {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const originLat = origin?.lat;
  const originLng = origin?.lng;
  const destLat = destination?.lat;
  const destLng = destination?.lng;
  const avoidTollRoads = options.avoidTollRoads ?? false;

  useEffect(() => {
    setIsError(false);

    if (
      originLat === undefined ||
      originLng === undefined ||
      destLat === undefined ||
      destLng === undefined
    ) {
      setRoute(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    fetchRoute(
      { lat: originLat, lng: originLng },
      { lat: destLat, lng: destLng },
      { avoidTollRoads },
    )
      .then((built) => {
        if (!isCancelled) setRoute(built);
      })
      .catch((error) => {
        console.error("Не удалось построить маршрут", error);
        if (!isCancelled) {
          setRoute(null);
          setIsError(true);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [originLat, originLng, destLat, destLng, avoidTollRoads]);

  return { route, isLoading, isError };
}
