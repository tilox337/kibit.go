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
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  inputRef,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <label className="search-menu__field">
      <span className="search-menu__label">{label}</span>
      <input
        ref={inputRef}
        className="search-menu__input"
        type="search"
        placeholder={placeholder}
        value={value}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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
  onSelectOrigin: (place: Place) => void;
  onResetOrigin: () => void;
  isFavorite: (placeId: string) => boolean;
  onToggleFavorite: (place: Place) => void;
  isMobileVisible: boolean;
  onMobileClose: () => void;
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
  onSelectOrigin,
  onResetOrigin,
  isFavorite,
  onToggleFavorite,
  isMobileVisible,
  onMobileClose,
}: SearchMenuProps) {
  const [destinationQuery, setDestinationQuery] = useState("");
  const [originQuery, setOriginQuery] = useState("");
  const [activeField, setActiveField] = useState<"origin" | "destination">(
    "destination",
  );
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobileVisible) destinationInputRef.current?.focus();
  }, [isMobileVisible]);

  const destinationSearch = useSearchResults(destinationQuery);
  const originSearch = useSearchResults(originQuery);
  const activeSearch =
    activeField === "origin" ? originSearch : destinationSearch;
  const recommendations = useRecommendations();
  const { history, addTrip } = useTripHistory();

  const close = () => {
    setIsOpen(false);
    destinationInputRef.current?.blur();
    originInputRef.current?.blur();
    onMobileClose();
  };
  useCloseOnOutside(menuRef, isOpen, close);

  const handleSelect = (place: Place) => {
    addTrip(place);
    onSelectPlace(place);
    setDestinationQuery(place.name);
    close();
  };

  const handleSelectOrigin = (place: Place) => {
    onSelectOrigin(place);
    setOriginQuery(place.name);
    setActiveField("destination");
    destinationInputRef.current?.focus();
  };

  const handleOriginChange = (value: string) => {
    setOriginQuery(value);
    if (!value.trim()) onResetOrigin();
  };

  const historyPlaces = history.map((record) => record.place);
  const { results, isLoading, isSearching } = activeSearch;
  const showNothingFound = isSearching && !isLoading && results.length === 0;

  const sectionProps = {
    isFavorite,
    onSelect: activeField === "origin" ? handleSelectOrigin : handleSelect,
    onToggleFavorite,
  };

  return (
    <div
      className={
        isMobileVisible
          ? "search-menu"
          : "search-menu search-menu--mobile-hidden"
      }
      ref={menuRef}
    >
      <SearchInput
        label="Откуда"
        placeholder="Моё местоположение"
        value={originQuery}
        onChange={handleOriginChange}
        onFocus={() => {
          setActiveField("origin");
          setIsOpen(true);
        }}
        inputRef={originInputRef}
      />
      <SearchInput
        label="Куда"
        placeholder="Введите адрес или место"
        value={destinationQuery}
        onChange={setDestinationQuery}
        onFocus={() => {
          setActiveField("destination");
          setIsOpen(true);
        }}
        inputRef={destinationInputRef}
      />

      {isOpen &&
        (isSearching ? (
          <>
            {isLoading && <p className="search-menu__hint">Ищем...</p>}
            {showNothingFound && (
              <p className="search-menu__hint">Ничего не найдено</p>
            )}
            <PlaceSection
              title={activeField === "origin" ? "Начало маршрута" : "Результаты"}
              places={results}
              {...sectionProps}
            />
          </>
        ) : activeField === "destination" ? (
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
        ) : null)}
    </div>
  );
}
