import { useEffect, useState } from "react";
import { getTrafficLightPhase, type LightColor, type TrafficLightSchedule } from "../trafficLight";
import styles from "./TrafficLightPopup.module.css";

type TrafficLightPopupProps = {
  schedule: TrafficLightSchedule;
};

const COLOR_LABEL: Record<LightColor, string> = {
  green: "Зелёный",
  yellow: "Жёлтый",
  red: "Красный",
};

const LAMPS: LightColor[] = ["red", "yellow", "green"];

function secondsPhrase(secondsLeft: number): string {
  const count = Math.max(1, Math.ceil(secondsLeft));
  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = "секунд";
  if (mod10 === 1 && mod100 !== 11) word = "секунда";
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = "секунды";
  return `${count} ${word}`;
}

export default function TrafficLightPopup({ schedule }: TrafficLightPopupProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 200);
    return () => window.clearInterval(timer);
  }, []);

  const phase = getTrafficLightPhase(now, schedule);

  return (
    <div className={styles.overlay}>
      <div className={styles.card} data-color={phase.color}>
        <div className={styles.housing} aria-hidden="true">
          {LAMPS.map((color) => (
            <span
              key={color}
              className={`${styles.lamp} ${styles[color]} ${phase.color === color ? styles.lit : ""}`}
            />
          ))}
        </div>
        <div className={styles.text}>
          <p className={styles.color}>{COLOR_LABEL[phase.color]}</p>
          {phase.secondsLeft !== null && <p className={styles.time}>{secondsPhrase(phase.secondsLeft)}</p>}
        </div>
      </div>
    </div>
  );
}
