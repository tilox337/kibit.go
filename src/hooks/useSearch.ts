import { useCallback, useEffect, useState } from "react";
import {
  addFavorite,
  addTripToHistory,
  fetchFavorites,
  fetchRecommendations,
  fetchTripHistory,
  removeFavorite,
  searchPlaces,
} from "../api/searchApi";
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH } from "../constants/search";
import type { Place, TripRecord } from "../types/search";

// Значение, которое обновляется только после паузы (чтобы не искать на каждую букву)
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

// Результаты поиска по тому, что набрали в поле
export function useSearchResults(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery.length < SEARCH_MIN_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    searchPlaces(debouncedQuery)
      .then((found) => {
        if (!isCancelled) setResults(found);
      })
      .catch((error) => {
        console.error("Не удалось выполнить поиск", error);
        if (!isCancelled) setResults([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const isSearching = query.trim().length >= SEARCH_MIN_LENGTH;
  // Пока ждём паузу в наборе, тоже считаем, что ищем
  const isWaiting = isSearching && query.trim() !== debouncedQuery;
  return { results, isLoading: isLoading || isWaiting, isSearching };
}

// Рекомендации для пустого поиска
export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Place[]>([]);

  useEffect(() => {
    let isCancelled = false;
    fetchRecommendations()
      .then((loaded) => {
        if (!isCancelled) setRecommendations(loaded);
      })
      .catch((error) =>
        console.error("Не удалось загрузить рекомендации", error),
      );
    return () => {
      isCancelled = true;
    };
  }, []);

  return recommendations;
}

// История поездок: загрузка и добавление новой
export function useTripHistory() {
  const [history, setHistory] = useState<TripRecord[]>([]);

  useEffect(() => {
    let isCancelled = false;
    fetchTripHistory()
      .then((loaded) => {
        if (!isCancelled) setHistory(loaded);
      })
      .catch((error) => console.error("Не удалось загрузить историю", error));
    return () => {
      isCancelled = true;
    };
  }, []);

  const addTrip = useCallback((place: Place) => {
    addTripToHistory(place)
      .then(setHistory)
      .catch((error) =>
        console.error("Не удалось сохранить поездку в историю", error),
      );
  }, []);

  return { history, addTrip };
}

// Избранное: загрузка, проверка и переключение звёздочкой
export function useFavorites() {
  const [favorites, setFavorites] = useState<Place[]>([]);

  useEffect(() => {
    let isCancelled = false;
    fetchFavorites()
      .then((loaded) => {
        if (!isCancelled) setFavorites(loaded);
      })
      .catch((error) => console.error("Не удалось загрузить избранное", error));
    return () => {
      isCancelled = true;
    };
  }, []);

  const isFavorite = (placeId: string) =>
    favorites.some((place) => place.id === placeId);

  const toggleFavorite = (place: Place) => {
    if (isFavorite(place.id)) {
      setFavorites((current) => current.filter((item) => item.id !== place.id));
      removeFavorite(place.id).catch((error) =>
        console.error("Не удалось убрать из избранного", error),
      );
    } else {
      setFavorites((current) => [...current, place]);
      addFavorite(place).catch((error) =>
        console.error("Не удалось добавить в избранное", error),
      );
    }
  };

  return { favorites, isFavorite, toggleFavorite };
}
