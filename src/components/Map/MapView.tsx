import { divIcon, type Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  ZoomControl,
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
import { YELLOW_SECONDS } from "../../constants/trafficLight";
import { ROUTE_FIT_PADDING } from "../../constants/route";
import { DESTINATION_ZOOM } from "../../constants/search";
import type { LatLng, Route } from "../../types/route";
import type { Place } from "../../types/search";
import type { TrafficLightPoint } from "../../types/trafficLight";
import { getPhaseOffsetSeconds } from "../../utils/trafficLight";
import TrafficLightPopup from "../TrafficLightPopup/TrafficLightPopup";
import "./MapView.css";

const TRAFFIC_LIGHT_POPUP_ZOOM = 16;

const LIGHT_ICON = divIcon({
  className: "traffic-marker",
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
export function MapFlyTo({
  target,
  zoom,
}: {
  target: Place | LatLng | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], zoom ?? map.getZoom());
  }, [target, zoom, map]);

  return null;
}

// Невидимый компонент: вписывает маршрут в экран, когда он построен
export function MapFitRoute({ route }: { route: Route | null }) {
  const map = useMap();

  useEffect(() => {
    if (route) {
      map.fitBounds(route.points, {
        padding: [ROUTE_FIT_PADDING, ROUTE_FIT_PADDING],
      });
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
  showPopup,
  onDelete,
}: {
  light: TrafficLightPoint;
  showPopup: boolean;
  onDelete: (id: string) => void;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const cycleLength = light.redSeconds + light.greenSeconds + YELLOW_SECONDS;
  const phaseOffsetSeconds =
    light.phaseOffsetSeconds ?? getPhaseOffsetSeconds(light.id, cycleLength);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (showPopup) markerRef.current?.openPopup();
      else markerRef.current?.closePopup();
    });

    return () => cancelAnimationFrame(frame);
  }, [showPopup]);

  return (
    <Marker ref={markerRef} position={[light.lat, light.lng]} icon={LIGHT_ICON}>
      {showPopup && (
        <Popup
          autoClose={false}
          autoPan={false}
          closeButton={false}
          closeOnClick={false}
        >
          <TrafficLightPopup
            redSeconds={light.redSeconds}
            greenSeconds={light.greenSeconds}
            startHour={light.startHour}
            phaseOffsetSeconds={phaseOffsetSeconds}
            onDelete={() => onDelete(light.id)}
          />
        </Popup>
      )}
    </Marker>
  );
}

function TrafficLightLayer({
  lights,
  onDeleteLight,
}: {
  lights: TrafficLightPoint[];
  onDeleteLight: (id: string) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  return lights.map((light) => (
    <TrafficLightMarker
      key={light.id}
      light={light}
      showPopup={zoom >= TRAFFIC_LIGHT_POPUP_ZOOM}
      onDelete={onDeleteLight}
    />
  ));
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
  isPlacing: boolean; // включён режим установки точки (светофора или «Я здесь»)
  origin: LatLng | null; // точка «Я здесь»
  destination: Place | null; // выбранный пункт назначения
  route: Route | null;
  onMapClick: (lat: number, lng: number) => void;
  onDeleteLight: (id: string) => void;
}

// Карта OpenStreetMap со светофорами и маршрутом
export default function MapView({
  lights,
  isPlacing,
  origin,
  destination,
  route,
  onMapClick,
  onDeleteLight,
}: MapViewProps) {
  const wrapperClass = isPlacing ? "map-view map-view--placing" : "map-view";

  return (
    <div className={wrapperClass}>
      <MapContainer
        className="map-view__map"
        center={MAP_DEFAULT_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          url={OSM_TILE_URL}
          attribution={OSM_ATTRIBUTION}
          maxZoom={MAP_MAX_ZOOM}
        />
        <MapClickHandler onClick={onMapClick} />
        {/* Если есть «Я здесь», карту ведёт маршрут, иначе подлетаем к месту */}
        <MapFlyTo target={origin} />
        <MapFlyTo
          target={origin ? null : destination}
          zoom={DESTINATION_ZOOM}
        />
        <MapFitRoute route={route} />
        {route && <RouteLine route={route} />}
        {origin && <OriginMarker origin={origin} />}
        {destination && <DestinationMarker place={destination} />}
        <TrafficLightLayer lights={lights} onDeleteLight={onDeleteLight} />
      </MapContainer>
    </div>
  );
}
