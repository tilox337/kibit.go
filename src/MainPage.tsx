import { useState } from "react";
import FavoritesPanel from "./components/Favorites/FavoritesPanel";
import MapView, { PlaceModeButton } from "./components/Map/MapView";
import RouteCard from "./components/Route/RouteCard";
import SearchMenu from "./components/SearchMenu/SearchMenu";
import TrafficLightPopup from "./components/TrafficLightPopup/TrafficLightPopup";
import { useRoute } from "./hooks/useRoute";
import { useFavorites } from "./hooks/useSearch";
import { useTrafficLights } from "./hooks/useTrafficLight";
import type { LatLng, MapMode } from "./types/route";
import type { Place } from "./types/search";

export default function MainPage() {
  const { lights, addLight, removeLight } = useTrafficLights();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<MapMode>("idle");
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const { route, isLoading, isError } = useRoute(origin, destination);

  const selectedLight = lights.find((light) => light.id === selectedId);

  // Включить режим установки или выключить, если он уже включён
  const toggleMode = (target: MapMode) =>
    setMode((current) => (current === target ? "idle" : target));

  // Клик по карте: ставим светофор или «Я здесь», в обычном режиме снимаем выбор
  const handleMapClick = (lat: number, lng: number) => {
    if (mode === "light") {
      const light = addLight(lat, lng);
      setSelectedId(light.id);
    } else if (mode === "origin") {
      setOrigin({ lat, lng });
    } else {
      setSelectedId(null);
    }
    setMode("idle");
  };

  // Удаляем выбранный светофор и закрываем его всплывашку
  const handleDeleteLight = (id: string) => {
    removeLight(id);
    setSelectedId(null);
  };

  return (
    <>
      <MapView
        lights={lights}
        selectedId={selectedId}
        isPlacing={mode !== "idle"}
        origin={origin}
        destination={destination}
        route={route}
        onMapClick={handleMapClick}
        onLightClick={setSelectedId}
      />
      <SearchMenu
        onSelectPlace={setDestination}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
      <FavoritesPanel
        favorites={favorites}
        isFavorite={isFavorite}
        onSelectPlace={setDestination}
        onToggleFavorite={toggleFavorite}
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
      {selectedLight && (
        <TrafficLightPopup
          key={selectedLight.id}
          redSeconds={selectedLight.redSeconds}
          greenSeconds={selectedLight.greenSeconds}
          startHour={selectedLight.startHour}
          onDelete={() => handleDeleteLight(selectedLight.id)}
        />
      )}
    </>
  );
}
