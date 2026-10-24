import type { Place } from "../../types/search";
import { PlaceSection } from "../SearchMenu/SearchMenu";
import "./FavoritesPanel.css";

// Круглая кнопка-звёздочка справа снизу
export function FavoritesToggle({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={
        isOpen ? "favorites__toggle favorites__toggle--on" : "favorites__toggle"
      }
      onClick={onToggle}
      aria-label="Избранное"
      title="Избранное"
    >
      ★
    </button>
  );
}

interface FavoritesPanelProps {
  favorites: Place[];
  isFavorite: (placeId: string) => boolean;
  onSelectPlace: (place: Place) => void;
  onToggleFavorite: (place: Place) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Звёздочка справа снизу, по клику открывает список избранного
export default function FavoritesPanel({
  favorites,
  isFavorite,
  onSelectPlace,
  onToggleFavorite,
  isOpen,
  onToggle,
}: FavoritesPanelProps) {
  const handleSelect = (place: Place) => {
    onSelectPlace(place);
    onToggle();
  };

  return (
    <div className="favorites">
      {isOpen && (
        <div className="favorites__panel">
          {favorites.length === 0 ? (
            <p className="favorites__empty">
              Пока пусто. Нажмите ☆ у места, чтобы добавить его сюда.
            </p>
          ) : (
            <PlaceSection
              title="Избранное"
              places={favorites}
              isFavorite={isFavorite}
              onSelect={handleSelect}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        </div>
      )}
      <FavoritesToggle isOpen={isOpen} onToggle={onToggle} />
    </div>
  );
}
