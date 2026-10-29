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
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [userLocationFocusRequest, setUserLocationFocusRequest] = useState(0);
  const [routeOrigin, setRouteOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const hasInitialLocationFix = useRef(false);
  const shouldFocusWhenLocated = useRef(false);
  const [isRouteStarted, setIsRouteStarted] = useState(false);
  const activeOrigin = routeOrigin ?? userLocation;
  const { route, isLoading, isError } = useRoute(activeOrigin, destination, {
    avoidTollRoads: settings.avoidTollRoads,
  });

  useEffect(() => {
    writeStorage(SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    let isActive = true;
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (!isActive) return;
        const location = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(location);

        if (!hasInitialLocationFix.current || shouldFocusWhenLocated.current) {
          hasInitialLocationFix.current = true;
          shouldFocusWhenLocated.current = false;
          setUserLocationFocusRequest((request) => request + 1);
        }
      },
      (error) => {
        if (isActive && error.code !== error.PERMISSION_DENIED) {
          console.warn("Не удалось определить местоположение", error);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );

    return () => {
      isActive = false;
      navigator.geolocation.clearWatch(watchId);
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

  const handleLocateUser = () => {
    if (userLocation) {
      shouldFocusWhenLocated.current = false;
      setUserLocationFocusRequest((request) => request + 1);
    } else {
      shouldFocusWhenLocated.current = true;
    }
  };

  // Включить режим установки или выключить, если он уже включён
  const toggleMode = (target: MapMode) =>
    setMode((current) => (current === target ? "idle" : target));

  // Клик по карте: ставим светофор; в обычном режиме снимаем выбор
  const handleMapClick = (lat: number, lng: number) => {
    if (mode === "light") {
      addLight(lat, lng);
    }
    setMode("idle");
    setIsMenuOpen(false);
  };

  const handleCancelRoute = () => {
    setDestination(null);
    setIsRouteStarted(false);
  };
  return (
    <>
      <MapView
        lights={lights}
        isPlacing={mode !== "idle"}
        userLocation={userLocation}
        userLocationFocusRequest={userLocationFocusRequest}
        routeOrigin={routeOrigin}
        destination={destination}
        route={route}
        isRouteStarted={isRouteStarted}
        onMapClick={handleMapClick}
        onDeleteLight={removeLight}
      />
      <SearchMenu
        onSelectPlace={setDestination}
        onSelectOrigin={(place) =>
          setRouteOrigin({ lat: place.lat, lng: place.lng })
        }
        onResetOrigin={() => setRouteOrigin(null)}
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
        <button
          className="place-button"
          type="button"
          onClick={handleLocateUser}
        >
          Я здесь
        </button>
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
        <button
          className="place-button"
          type="button"
          onClick={handleLocateUser}
        >
          Я здесь
        </button>
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
          className="mobile-nav__button"
          type="button"
          aria-label="Показать моё местоположение на карте"
          onClick={() => {
            handleLocateUser();
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
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "400px",
            zIndex: 1100,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <RouteCard
            destination={destination}
            hasOrigin={activeOrigin !== null}
            route={route}
            isLoading={isLoading}
            isError={isError}
            onCancel={() => {
              setDestination(null);
              setIsRouteStarted(false);
            }}
          />

          {route && !isLoading && !isError && (
            <div style={{ width: "100%" }}>
              {!isRouteStarted ? (
                <button
                  className="place-button"
                  type="button"
                  style={{
                    width: "100%",
                    backgroundColor: "#1e88e5",
                    color: "white",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                  onClick={() => setIsRouteStarted(true)}
                >
                  Начать путь
                </button>
              ) : (
                <button
                  className="place-button"
                  type="button"
                  style={{
                    width: "100%",
                    backgroundColor: "#e53935",
                    color: "white",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                  onClick={() => {
                    setIsRouteStarted(false);
                    setDestination(null);
                    if (typeof setRouteOrigin === "function") {
                      setRouteOrigin(null);
                    }
                  }}
                >
                  Остановить маршрут
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
