//заглушка СУКА ЗАААААГЛУУУШКА

import TrafficLightPopup from "../components/TrafficLightPopup";
import type { TrafficLightSchedule } from "../trafficLight";
import styles from "./AuthPage.module.css";
import layout from "./MainPage.module.css";

type MainPageProps = {
  email: string;
  onLogout: () => void;
  trafficLight: TrafficLightSchedule;
};

export default function MainPage({ email, onLogout, trafficLight }: MainPageProps) {
  return (
    <div className={styles.page}>
      <div className={`${styles.panel} ${layout.account}`}>
        <p>Вы вошли как {email}</p>
        <button className={styles.button} type="button" onClick={onLogout}>
          Выйти
        </button>
      </div>
      <TrafficLightPopup schedule={trafficLight} />
    </div>
  );
}
