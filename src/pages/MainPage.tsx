//заглушка СУКА ЗАААААГЛУУУШКА

import styles from "./AuthPage.module.css";

type MainPageProps = {
  email: string;
  onLogout: () => void;
};

export default function MainPage({ email, onLogout }: MainPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <p>Вы вошли как {email}</p>
        <button className={styles.button} type="button" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </div>
  );
}
