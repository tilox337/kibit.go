import { useEffect, useRef, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface SettingsValue {
  volume: 0 | 1 | 2 | 3;
  theme: ThemeMode;
  avoidTollRoads: boolean;
  cursorColor: string;
}

interface SettingsProps {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
  settings: SettingsValue;
  onSettingsChange: (settings: SettingsValue) => void;
}

const VOLUME_LEVELS = [
  { value: 0, label: "Без звука", icon: "🔇" },
  { value: 1, label: "Тихо", icon: "🔈" },
  { value: 2, label: "Средне", icon: "🔉" },
  { value: 3, label: "Громко", icon: "🔊" },
] as const;

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
  { value: "system", label: "Системная" },
];

export default function Settings({
  isOpen,
  children,
  onClose,
  settings,
  onSettingsChange,
}: SettingsProps) {
  const touchStartY = useRef<number | null>(null);
  const [showAllSettings, setShowAllSettings] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateSettings = (changes: Partial<SettingsValue>) =>
    onSettingsChange({ ...settings, ...changes });

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startY = touchStartY.current;
    touchStartY.current = null;

    if (
      startY !== null &&
      event.changedTouches[0].clientY - startY > 80 &&
      event.currentTarget.scrollTop === 0
    ) {
      onClose();
    }
  };

  return (
    <div
      className="settings-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="settings-panel"
        id="mobile-tools-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-panel-title"
        onTouchStart={(event) => {
          touchStartY.current = event.changedTouches[0].clientY;
        }}
        onTouchEnd={handleTouchEnd}
      >
        <header className="settings-panel__header">
          <h2 className="settings-panel__title" id="settings-panel-title">
            Настройки карты
          </h2>
          <button
            className="settings-panel__close"
            type="button"
            aria-label="Закрыть настройки"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="settings-panel__section">
          <h3 className="settings-panel__label">Маршрут</h3>
          {children}
        </div>
        <section className="settings-panel__section">
          <h3 className="settings-panel__label">Громкость</h3>
          <div className="settings-volume" role="group" aria-label="Громкость">
            {VOLUME_LEVELS.map((level) => (
              <button
                key={level.value}
                className={
                  settings.volume === level.value
                    ? "settings-volume__button settings-volume__button--active"
                    : "settings-volume__button"
                }
                type="button"
                aria-label={level.label}
                aria-pressed={settings.volume === level.value}
                onClick={() => updateSettings({ volume: level.value })}
              >
                {level.icon}
              </button>
            ))}
          </div>
          <p className="settings-panel__hint">Звуковых сигналов пока нет</p>
        </section>
        <fieldset className="settings-panel__section settings-theme">
          <legend className="settings-panel__label">Тема</legend>
          {THEMES.map((theme) => (
            <label className="settings-option" key={theme.value}>
              <span>{theme.label}</span>
              <input
                type="radio"
                name="settings-theme"
                value={theme.value}
                checked={settings.theme === theme.value}
                onChange={() => updateSettings({ theme: theme.value })}
              />
            </label>
          ))}
        </fieldset>
        <button
          className="settings-panel__all"
          type="button"
          aria-expanded={showAllSettings}
          onClick={() => setShowAllSettings((expanded) => !expanded)}
        >
          {showAllSettings
            ? "Скрыть дополнительные настройки"
            : "Все настройки"}
        </button>
        {showAllSettings && (
          <section className="settings-panel__section">
            <h3 className="settings-panel__label">Дополнительно</h3>
            <label className="settings-option">
              <span>Объезжать платные дороги</span>
              <input
                type="checkbox"
                checked={settings.avoidTollRoads}
                onChange={(event) =>
                  updateSettings({ avoidTollRoads: event.target.checked })
                }
              />
            </label>
            <label className="settings-option settings-option--disabled">
              <span>Объезжать плохие и грунтовые дороги</span>
              <input type="checkbox" disabled aria-label="Недоступно" />
            </label>
            <p className="settings-panel__hint">
              Текущий сервис маршрутов не поддерживает этот фильтр.
            </p>
            <label className="settings-color">
              <span>Цвет курсора</span>
              <input
                type="color"
                value={settings.cursorColor}
                onChange={(event) =>
                  updateSettings({ cursorColor: event.target.value })
                }
              />
            </label>
          </section>
        )}
      </section>
    </div>
  );
}
