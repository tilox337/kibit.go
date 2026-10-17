import { useEffect, useRef, useState } from "react";
import FavoritesPanel from "./components/Favorites/FavoritesPanel";
import MapView, { PlaceModeButton } from "./components/Map/MapView";
import RouteCard from "./components/Route/RouteCard";
import SearchMenu from "./components/SearchMenu/SearchMenu";
import Settings, { type SettingsValue } from "./Settings";
import { useRoute } from "./hooks/useRoute";
import { useFavorites } from "./hooks/useSearch";
import { useTrafficLights } from "./hooks/useTrafficLight";
import type { LatLng, MapMode } from "./types/route";
import type { Place } from "./types/search";
import { readStorage, writeStorage } from "./utils/storage";

const SETTINGS_STORAGE_KEY = "kibit-go-settings";
const DEFAULT_SETTINGS: SettingsValue = {
  volume: 2,
  theme: "system",
  avoidTollRoads: false,
  cursorColor: "#1e88e5",
};

export default function MainPage() {
  const { lights, addLight, removeLight } = useTrafficLights();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [settings, setSettings] = useState(() =>
    readStorage(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS),
  );
  const [mode, setMode] = useState<MapMode>("idle");
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const hasRequestedLocation = useRef(false);
  const hasManualOrigin = useRef(false);
  const { route, isLoading, isError } = useRoute(origin, destination, {
    avoidTollRoads: settings.avoidTollRoads,
  });

  useEffect(() => {
    writeStorage(SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  useEffect(() => {
    if (
      !window.matchMedia("(max-width: 700px)").matches ||
      !navigator.geolocation ||
      hasRequestedLocation.current
    ) {
      return;
    }

    hasRequestedLocation.current = true;
    let isCancelled = false;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!isCancelled && !hasManualOrigin.current) {
          setOrigin({ lat: coords.latitude, lng: coords.longitude });
        }
      },
      (error) => {
        if (error.code !== error.PERMISSION_DENIED) {
          console.warn("Не удалось определить местоположение", error);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      root.dataset.theme =
        settings.theme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : settings.theme;
    };
    const cursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 1v22M1 12h22" stroke="${settings.cursorColor}" stroke-width="2"/></svg>`;

    applyTheme();
    root.style.setProperty(
      "--map-cursor",
      `url("data:image/svg+xml,${encodeURIComponent(cursorSvg)}") 12 12, crosshair`,
    );
    if (settings.theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
    }

    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [settings.theme, settings.cursorColor]);

  // Включить режим установки или выключить, если он уже включён
  const toggleMode = (target: MapMode) =>
    setMode((current) => (current === target ? "idle" : target));

  // Клик по карте: ставим светофор или «Я здесь», в обычном режиме снимаем выбор
  const handleMapClick = (lat: number, lng: number) => {
    if (mode === "light") {
      addLight(lat, lng);
    } else if (mode === "origin") {
      hasManualOrigin.current = true;
      setOrigin({ lat, lng });
    }
    setMode("idle");
    setIsMenuOpen(false);
  };

  return (
    <>
      <MapView
        lights={lights}
        isPlacing={mode !== "idle"}
        origin={origin}
        destination={destination}
        route={route}
        onMapClick={handleMapClick}
        onDeleteLight={removeLight}
      />
      <SearchMenu
        onSelectPlace={setDestination}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        isMobileVisible={isSearchVisible}
        onMobileClose={() => setIsSearchVisible(false)}
      />
      <FavoritesPanel
        favorites={favorites}
        isFavorite={isFavorite}
        onSelectPlace={setDestination}
        onToggleFavorite={toggleFavorite}
        isOpen={isFavoritesOpen}
        onToggle={() => setIsFavoritesOpen((open) => !open)}
      />
      <div className="map-toolbar">
        <PlaceModeButton
          label="Я здесь"
          activeLabel="Нажмите, где вы..."
          isActive={mode === "origin"}
          onToggle={() => toggleMode("origin")}
        />
        <PlaceModeButton
          label="Поставить светофор"
          activeLabel="Нажмите на карту..."
          isActive={mode === "light"}
          onToggle={() => toggleMode("light")}
        />
      </div>
      <Settings
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      >
        <PlaceModeButton
          label="Я здесь"
          activeLabel="Нажмите, где вы..."
          isActive={mode === "origin"}
          onToggle={() => toggleMode("origin")}
        />
        {destination && (
          <button
            className="settings-panel__action"
            type="button"
            onClick={() => setDestination(null)}
          >
            Сбросить маршрут
          </button>
        )}
      </Settings>
      <nav
        className="mobile-nav"
        aria-label="Основные действия"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className={
            isSearchVisible
              ? "mobile-nav__button mobile-nav__button--active"
              : "mobile-nav__button"
          }
          type="button"
          aria-expanded={isSearchVisible}
          onClick={() => {
            setIsSearchVisible(!isSearchVisible);
            setIsMenuOpen(false);
            setIsFavoritesOpen(false);
          }}
        >
          <span aria-hidden="true">⌕</span>
          <span>Поиск</span>
        </button>
        <button
          className={
            isFavoritesOpen
              ? "mobile-nav__button mobile-nav__button--active"
              : "mobile-nav__button"
          }
          type="button"
          aria-expanded={isFavoritesOpen}
          onClick={() => {
            setIsFavoritesOpen((open) => !open);
            setIsSearchVisible(false);
            setIsMenuOpen(false);
          }}
        >
          <span aria-hidden="true">★</span>
          <span>Избранное</span>
        </button>
        <button
          className={
            mode === "origin"
              ? "mobile-nav__button mobile-nav__button--active"
              : "mobile-nav__button"
          }
          type="button"
          aria-pressed={mode === "origin"}
          onClick={() => {
            toggleMode("origin");
            setIsSearchVisible(false);
            setIsFavoritesOpen(false);
            setIsMenuOpen(false);
          }}
        >
          <span aria-hidden="true">⌖</span>
          <span>Я здесь</span>
        </button>
        <button
          className={
            isMenuOpen
              ? "mobile-nav__button mobile-nav__button--active"
              : "mobile-nav__button"
          }
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-tools-panel"
          onClick={() => {
            setIsMenuOpen((open) => !open);
            setIsSearchVisible(false);
            setIsFavoritesOpen(false);
          }}
        >
          <span aria-hidden="true">⚙</span>
          <span>Настройки</span>
        </button>
      </nav>
      {destination && (
        <RouteCard
          destination={destination}
          hasOrigin={origin !== null}
          route={route}
          isLoading={isLoading}
          isError={isError}
          onCancel={() => setDestination(null)}
        />
      )}
    </>
  );
}
