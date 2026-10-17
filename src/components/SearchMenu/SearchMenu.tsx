import { useEffect, useRef, useState } from "react";
import {
  useRecommendations,
  useSearchResults,
  useTripHistory,
} from "../../hooks/useSearch";
import type { Place } from "../../types/search";
import "./SearchMenu.css";

// ---------- Мелкие компоненты ----------

// Поле «Куда едем?»
export function SearchInput({
  value,
  onChange,
  onFocus,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <input
      ref={inputRef}
      className="search-menu__input"
      type="search"
      placeholder="Куда едем?"
      value={value}
      onFocus={onFocus}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

// Кнопка-звёздочка «в избранное»
export function FavoriteButton({
  isFavorite,
  onClick,
}: {
  isFavorite: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={isFavorite ? "fav-button fav-button--on" : "fav-button"}
      onClick={onClick}
      aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
      title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}

// Одна строка списка: место + звёздочка
export function PlaceItem({
  place,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  place: Place;
  isFavorite: boolean;
  onSelect: (place: Place) => void;
  onToggleFavorite: (place: Place) => void;
}) {
  return (
    <li className="place-item">
      <button className="place-item__main" onClick={() => onSelect(place)}>
        <span className="place-item__name">{place.name}</span>
        <span className="place-item__address">{place.address}</span>
      </button>
      <FavoriteButton
        isFavorite={isFavorite}
        onClick={() => onToggleFavorite(place)}
      />
    </li>
  );
}

// Раздел меню с заголовком. Пустой раздел не показываем
export function PlaceSection({
  title,
  places,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  title: string;
  places: Place[];
  isFavorite: (placeId: string) => boolean;
  onSelect: (place: Place) => void;
  onToggleFavorite: (place: Place) => void;
}) {
  if (places.length === 0) return null;

  return (
    <section className="search-menu__section">
      <h3 className="search-menu__title">{title}</h3>
      <ul className="search-menu__list">
        {places.map((place) => (
          <PlaceItem
            key={place.id}
            place={place}
            isFavorite={isFavorite(place.id)}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </ul>
    </section>
  );
}

// ---------- Меню поиска ----------

interface SearchMenuProps {
  onSelectPlace: (place: Place) => void; // выбрали пункт назначения
  isFavorite: (placeId: string) => boolean;
  onToggleFavorite: (place: Place) => void;
}

// Закрывает меню по клику вне его и по Escape
function useCloseOnOutside(
  ref: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, isOpen, onClose]);
}

// Поле ввода. При клике на него выдвигаются результаты, история и рекомендации
export default function SearchMenu({
  onSelectPlace,
  isFavorite,
  onToggleFavorite,
}: SearchMenuProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, isSearching } = useSearchResults(query);
  const recommendations = useRecommendations();
  const { history, addTrip } = useTripHistory();

  const close = () => {
    setIsOpen(false);
    inputRef.current?.blur();
  };
  useCloseOnOutside(menuRef, isOpen, close);

  const handleSelect = (place: Place) => {
    addTrip(place);
    onSelectPlace(place);
    setQuery(place.name);
    close();
  };

  const historyPlaces = history.map((record) => record.place);
  const showNothingFound = isSearching && !isLoading && results.length === 0;

  const sectionProps = {
    isFavorite,
    onSelect: handleSelect,
    onToggleFavorite,
  };

  return (
    <div className="search-menu" ref={menuRef}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onFocus={() => setIsOpen(true)}
        inputRef={inputRef}
      />

      {isOpen &&
        (isSearching ? (
          <>
            {isLoading && <p className="search-menu__hint">Ищем...</p>}
            {showNothingFound && (
              <p className="search-menu__hint">Ничего не найдено</p>
            )}
            <PlaceSection title="Результаты" places={results} {...sectionProps} />
          </>
        ) : (
          <>
            <PlaceSection
              title="Рекомендации"
              places={recommendations}
              {...sectionProps}
            />
            <PlaceSection
              title="История поездок"
              places={historyPlaces}
              {...sectionProps}
            />
          </>
        ))}
    </div>
  );
}
