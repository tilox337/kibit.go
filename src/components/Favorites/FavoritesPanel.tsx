import { useState } from "react";
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
      className={isOpen ? "favorites__toggle favorites__toggle--on" : "favorites__toggle"}
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
}

// Звёздочка справа снизу, по клику открывает список избранного
export default function FavoritesPanel({
  favorites,
  isFavorite,
  onSelectPlace,
  onToggleFavorite,
}: FavoritesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (place: Place) => {
    onSelectPlace(place);
    setIsOpen(false);
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
      <FavoritesToggle isOpen={isOpen} onToggle={() => setIsOpen((open) => !open)} />
    </div>
  );
}
