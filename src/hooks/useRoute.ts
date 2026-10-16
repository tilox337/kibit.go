import { useEffect, useState } from "react";
import { fetchRoute } from "../api/routeApi";
import type { LatLng, Route } from "../types/route";
import type { Place } from "../types/search";

// Маршрут от точки «Я здесь» до выбранного места. Строится заново при смене любой из точек
export function useRoute(origin: LatLng | null, destination: Place | null) {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const originLat = origin?.lat;
  const originLng = origin?.lng;
  const destLat = destination?.lat;
  const destLng = destination?.lng;

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
  }, [originLat, originLng, destLat, destLng]);

  return { route, isLoading, isError };
}
