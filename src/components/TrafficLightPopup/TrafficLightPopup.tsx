import type { ReactNode } from "react";
import { COLOR_LABELS, DEFAULT_START_HOUR } from "../../constants/trafficLight";
import { useTrafficLight } from "../../hooks/useTrafficLight";
import type { TrafficLightColor } from "../../types/trafficLight";
import "./TrafficLightPopup.css";

// ---------- Мелкие компоненты ----------

// Белая карточка по центру экрана, внутрь кладём любое содержимое
export function PopupShell({ children }: { children: ReactNode }) {
  return <div className="traffic-popup">{children}</div>;
}

// Цветной кружок светофора
export function TrafficLightDot({
  color,
  isFlashing,
}: {
  color: TrafficLightColor;
  isFlashing: boolean;
}) {
  const className = [
    "traffic-dot",
    `traffic-dot--${color}`,
    isFlashing ? "traffic-dot--flashing" : "",
  ].join(" ");

  return <div className={className} />;
}

// Название цвета текстом
export function ColorLabel({ color }: { color: TrafficLightColor }) {
  return <div className="traffic-popup__label">{COLOR_LABELS[color]}</div>;
}

// Сколько секунд осталось до смены цвета
export function TimeLeft({ seconds }: { seconds: number | null }) {
  if (seconds === null) return null;
  return <div className="traffic-popup__time">{seconds} с</div>;
}

// Сообщение, когда светофор ещё не начал работать
export function OffMessage({ startHour }: { startHour: number }) {
  return (
    <div className="traffic-popup__info">
      <div className="traffic-popup__label">Светофор пока не работает</div>
      <div className="traffic-popup__label">Начнёт в {startHour}:00</div>
    </div>
  );
}

// Кнопка удаления светофора
export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="traffic-popup__delete" onClick={onClick}>
      Удалить
    </button>
  );
}

// ---------- Всплывашка ----------

interface TrafficLightPopupProps {
  redSeconds: number; // сколько горит красный, сек
  greenSeconds: number; // сколько горит зелёный (вместе с морганием), сек
  startHour?: number; // во сколько начинается работа светофора, час (по умолчанию 5)
  phaseOffsetSeconds?: number;
  phaseNote?: string;
  onDelete?: () => void; // если передать, во всплывашке появится кнопка «Удалить»
}

// Состояние светофора, закреплённое за его меткой на карте
export default function TrafficLightPopup({
  redSeconds,
  greenSeconds,
  startHour = DEFAULT_START_HOUR,
  phaseOffsetSeconds = 0,
  phaseNote,
  onDelete,
}: TrafficLightPopupProps) {
  const { isWorking, color, secondsLeft, isFlashing } = useTrafficLight({
    redSeconds,
    greenSeconds,
    startHour,
    phaseOffsetSeconds,
  });

  return (
    <PopupShell>
      {isWorking && color ? (
        <>
          <TrafficLightDot color={color} isFlashing={isFlashing} />
          <div className="traffic-popup__info">
            <ColorLabel color={color} />
            <TimeLeft seconds={secondsLeft} />
          </div>
        </>
      ) : (
        <OffMessage startHour={startHour} />
      )}
      {phaseNote && <div className="traffic-popup__note">{phaseNote}</div>}
      {onDelete && <DeleteButton onClick={onDelete} />}
    </PopupShell>
  );
}
