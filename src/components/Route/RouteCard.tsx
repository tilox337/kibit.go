import { formatDistance, formatDuration } from "../../utils/route";
import type { Route } from "../../types/route";
import type { Place } from "../../types/search";
import "./RouteCard.css";

interface RouteCardProps {
  destination: Place;
  hasOrigin: boolean; // поставлена ли точка «Я здесь»
  route: Route | null;
  isLoading: boolean;
  isError: boolean;
  onCancel: () => void;
}

// Что написать в карточке в зависимости от состояния
function getStatusText({
  hasOrigin,
  route,
  isLoading,
  isError,
}: Pick<RouteCardProps, "hasOrigin" | "route" | "isLoading" | "isError">) {
  if (!hasOrigin) return "Нажмите «Я здесь» и укажите на карте, где вы находитесь";
  if (isError) return "Не удалось построить маршрут";
  if (isLoading || !route) return "Строим маршрут...";
  return `${formatDistance(route.distanceMeters)} · ${formatDuration(route.durationSeconds)}`;
}

// Карточка внизу слева: куда едем, расстояние и время, кнопка отмены
export default function RouteCard({
  destination,
  hasOrigin,
  route,
  isLoading,
  isError,
  onCancel,
}: RouteCardProps) {
  const status = getStatusText({ hasOrigin, route, isLoading, isError });

  return (
    <div className="route-card">
      <div className="route-card__info">
        <div className="route-card__title">{destination.name}</div>
        <div className="route-card__status">{status}</div>
      </div>
      <button
        className="route-card__cancel"
        onClick={onCancel}
        aria-label="Отменить маршрут"
        title="Отменить маршрут"
      >
        ✕
      </button>
    </div>
  );
}
