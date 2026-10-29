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
import {
  DEFAULT_GREEN_SECONDS,
  DEFAULT_RED_SECONDS,
  DEFAULT_START_HOUR,
  YELLOW_SECONDS,
} from "../../constants/trafficLight";
import { ROUTE_FIT_PADDING } from "../../constants/route";
import { DESTINATION_ZOOM } from "../../constants/search";
import { fetchOSMTrafficSignals } from "../../api/trafficLightApi";
import type { LatLng, Route } from "../../types/route";
import type { Place } from "../../types/search";
import type { TrafficLightPoint } from "../../types/trafficLight";
import { getPhaseOffsetSeconds } from "../../utils/trafficLight";
import TrafficLightPopup from "../TrafficLightPopup/TrafficLightPopup";
import "./MapView.css";

const TRAFFIC_LIGHT_POPUP_ZOOM = 16;
const OSM_TRAFFIC_LIGHT_MIN_ZOOM = 16;

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

const ROUTE_ORIGIN_ICON = divIcon({
  className: "route-origin-marker",
  html: "A",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const ROUTE_STYLE = { color: "#1e88e5", weight: 6, opacity: 0.85 };
const PASSED_ROUTE_STYLE = {
  color: "#555555",
  weight: 6,
  opacity: 1.0,
}; // Серый стиль для пройденного пути

function findClosestPointIndex(
  userLoc: LatLng,
  points: (LatLng | [number, number])[],
): number {
  let minDistance = Infinity;
  let closestIndex = 0;

  points.forEach((point, index) => {
    const ptLat = Array.isArray(point) ? point[0] : point.lat;
    const ptLng = Array.isArray(point) ? point[1] : point.lng;

    // Обычное евклидово расстояние (для малых дистанций этого более чем достаточно и это быстро)
    const distance =
      Math.pow(userLoc.lat - ptLat, 2) + Math.pow(userLoc.lng - ptLng, 2);

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

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

export function MapFocusOnUser({
  location,
  request,
}: {
  location: LatLng | null;
  request: number;
}) {
  const map = useMap();
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    const currentLocation = locationRef.current;
    if (currentLocation) {
      map.flyTo([currentLocation.lat, currentLocation.lng], map.getZoom());
    }
  }, [map, request]);

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

export function RouteOriginMarker({ origin }: { origin: LatLng }) {
  return (
    <Marker position={[origin.lat, origin.lng]} icon={ROUTE_ORIGIN_ICON} />
  );
}

//Линия маршрута
export function RouteLine({
  route,
  userLocation,
  isRouteStarted,
}: {
  route: Route;
  userLocation: LatLng | null;
  isRouteStarted: boolean;
}) {
  if (!isRouteStarted || !userLocation || !route.points.length) {
    return <Polyline positions={route.points} pathOptions={ROUTE_STYLE} />;
  }
  const closestIndex = findClosestPointIndex(userLocation, route.points);
  const passedPoints = route.points.slice(0, closestIndex + 1);
  const remainingPoints = route.points.slice(closestIndex);
  return (
    <>
      {passedPoints.length > 1 && (
        <Polyline positions={passedPoints} pathOptions={PASSED_ROUTE_STYLE} />
      )}
      {remainingPoints.length > 1 && (
        <Polyline positions={remainingPoints} pathOptions={ROUTE_STYLE} />
      )}
    </>
  );
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
  phaseNote,
}: {
  light: TrafficLightPoint;
  showPopup: boolean;
  onDelete?: (id: string) => void;
  phaseNote?: string;
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
            phaseNote={phaseNote}
            onDelete={onDelete ? () => onDelete(light.id) : undefined}
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
  const [boundsVersion, setBoundsVersion] = useState(0);
  const [osmLights, setOsmLights] = useState<TrafficLightPoint[]>([]);

  useMapEvents({
    moveend: () => {
      setZoom(map.getZoom());
      setBoundsVersion((version) => version + 1);
      setOsmLights([]);
    },
  });

  useEffect(() => {
    if (zoom < OSM_TRAFFIC_LIGHT_MIN_ZOOM) return;

    const bounds = map.getBounds();
    const controller = new AbortController();

    fetchOSMTrafficSignals(
      {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      },
      controller.signal,
    )
      .then((signals) => {
        const cycleLength =
          DEFAULT_RED_SECONDS + DEFAULT_GREEN_SECONDS + YELLOW_SECONDS;
        setOsmLights(
          signals.map((signal) => {
            const id = `osm-${signal.id}`;
            return {
              id,
              lat: signal.lat,
              lng: signal.lng,
              redSeconds: DEFAULT_RED_SECONDS,
              greenSeconds: DEFAULT_GREEN_SECONDS,
              startHour: DEFAULT_START_HOUR,
              phaseOffsetSeconds: getPhaseOffsetSeconds(id, cycleLength),
            };
          }),
        );
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Не удалось загрузить OSM-светофоры", error);
      });

    return () => controller.abort();
  }, [boundsVersion, map, zoom]);

  return (
    <>
      {lights.map((light) => (
        <TrafficLightMarker
          key={light.id}
          light={light}
          showPopup={zoom >= TRAFFIC_LIGHT_POPUP_ZOOM}
          onDelete={onDeleteLight}
        />
      ))}
      {zoom >= OSM_TRAFFIC_LIGHT_MIN_ZOOM &&
        osmLights.map((light) => (
          <TrafficLightMarker
            key={light.id}
            light={light}
            showPopup={zoom >= TRAFFIC_LIGHT_POPUP_ZOOM}
            phaseNote="Условные фазы: OSM не содержит расписание светофора"
          />
        ))}
    </>
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
  isPlacing: boolean; // включён режим установки точки (светофора или «Я здесь»)
  userLocation: LatLng | null;
  userLocationFocusRequest: number;
  routeOrigin: LatLng | null;
  destination: Place | null; // выбранный пункт назначения
  route: Route | null;
  isRouteStarted: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onDeleteLight: (id: string) => void;
}

// Карта OpenStreetMap со светофорами и маршрутом
export default function MapView({
  lights,
  isPlacing,
  userLocation,
  userLocationFocusRequest,
  routeOrigin,
  destination,
  route,
  isRouteStarted,
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
        <MapFlyTo target={routeOrigin} />
        <MapFocusOnUser
          location={userLocation}
          request={userLocationFocusRequest}
        />

        {!isRouteStarted && (
          <MapFlyTo
            target={routeOrigin || userLocation ? null : destination}
            zoom={DESTINATION_ZOOM}
          />
        )}
        {!isRouteStarted && <MapFitRoute route={route} />}
        {route && (
          <RouteLine
            route={route}
            userLocation={userLocation}
            isRouteStarted={isRouteStarted}
          />
        )}
        {userLocation && <OriginMarker origin={userLocation} />}
        {routeOrigin && <RouteOriginMarker origin={routeOrigin} />}
        {destination && <DestinationMarker place={destination} />}
        <TrafficLightLayer lights={lights} onDeleteLight={onDeleteLight} />
      </MapContainer>
    </div>
  );
}
