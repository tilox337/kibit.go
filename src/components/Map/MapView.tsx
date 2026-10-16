import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_MAX_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "../../constants/map";
import { ROUTE_FIT_PADDING } from "../../constants/route";
import { DESTINATION_ZOOM } from "../../constants/search";
import type { LatLng, Route } from "../../types/route";
import type { Place } from "../../types/search";
import type { TrafficLightPoint } from "../../types/trafficLight";
import "./MapView.css";

const LIGHT_ICON = divIcon({
  className: "traffic-marker",
  html: "🚦",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const SELECTED_LIGHT_ICON = divIcon({
  className: "traffic-marker traffic-marker--selected",
  html: "🚦",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const DESTINATION_ICON = divIcon({
  className: "traffic-marker",
  html: "📍",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const ORIGIN_ICON = divIcon({
  className: "origin-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const ROUTE_STYLE = { color: "#1e88e5", weight: 6, opacity: 0.85 };

// ---------- Мелкие компоненты ----------

// Невидимый компонент: подлетает к пункту назначения, когда он меняется
export function MapFlyTo({ target }: { target: Place | null }) {
  const map = useMap();

  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], DESTINATION_ZOOM);
  }, [target, map]);

  return null;
}

// Невидимый компонент: вписывает маршрут в экран, когда он построен
export function MapFitRoute({ route }: { route: Route | null }) {
  const map = useMap();

  useEffect(() => {
    if (route) {
      map.fitBounds(route.points, { padding: [ROUTE_FIT_PADDING, ROUTE_FIT_PADDING] });
    }
  }, [route, map]);

  return null;
}

// Метка пункта назначения
export function DestinationMarker({ place }: { place: Place }) {
  return <Marker position={[place.lat, place.lng]} icon={DESTINATION_ICON} />;
}

// Метка «Я здесь»
export function OriginMarker({ origin }: { origin: LatLng }) {
  return <Marker position={[origin.lat, origin.lng]} icon={ORIGIN_ICON} />;
}

// Линия маршрута
export function RouteLine({ route }: { route: Route }) {
  return <Polyline positions={route.points} pathOptions={ROUTE_STYLE} />;
}

// Невидимый компонент: ловит клики по карте и отдаёт координаты
export function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (event) => onClick(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

// Светофор на карте
export function TrafficLightMarker({
  light,
  isSelected,
  onClick,
}: {
  light: TrafficLightPoint;
  isSelected: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <Marker
      position={[light.lat, light.lng]}
      icon={isSelected ? SELECTED_LIGHT_ICON : LIGHT_ICON}
      eventHandlers={{ click: () => onClick(light.id) }}
    />
  );
}

// Кнопка режима: пока включена, клик по карте что-то ставит
export function PlaceModeButton({
  label,
  activeLabel,
  isActive,
  onToggle,
}: {
  label: string;
  activeLabel: string;
  isActive: boolean;
  onToggle: () => void;
}) {
  const className = isActive
    ? "place-button place-button--active"
    : "place-button";

  return (
    <button className={className} onClick={onToggle}>
      {isActive ? activeLabel : label}
    </button>
  );
}

// ---------- Карта ----------

interface MapViewProps {
  lights: TrafficLightPoint[];
  selectedId: string | null;
  isPlacing: boolean; // включён режим установки точки (светофора или «Я здесь»)
  origin: LatLng | null; // точка «Я здесь»
  destination: Place | null; // выбранный пункт назначения
  route: Route | null;
  onMapClick: (lat: number, lng: number) => void;
  onLightClick: (id: string) => void;
}

// Карта OpenStreetMap со светофорами и маршрутом
export default function MapView({
  lights,
  selectedId,
  isPlacing,
  origin,
  destination,
  route,
  onMapClick,
  onLightClick,
}: MapViewProps) {
  const wrapperClass = isPlacing ? "map-view map-view--placing" : "map-view";

  return (
    <div className={wrapperClass}>
      <MapContainer
        className="map-view__map"
        center={MAP_DEFAULT_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
      >
        <TileLayer
          url={OSM_TILE_URL}
          attribution={OSM_ATTRIBUTION}
          maxZoom={MAP_MAX_ZOOM}
        />
        <MapClickHandler onClick={onMapClick} />
        {/* Если есть «Я здесь», карту ведёт маршрут, иначе подлетаем к месту */}
        <MapFlyTo target={origin ? null : destination} />
        <MapFitRoute route={route} />
        {route && <RouteLine route={route} />}
        {origin && <OriginMarker origin={origin} />}
        {destination && <DestinationMarker place={destination} />}
        {lights.map((light) => (
          <TrafficLightMarker
            key={light.id}
            light={light}
            isSelected={light.id === selectedId}
            onClick={onLightClick}
          />
        ))}
      </MapContainer>
    </div>
  );
}
