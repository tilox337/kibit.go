import { useState } from "react";
import "./App.css";
import MainPage from "./pages/MainPage";
import AuthPage from "./pages/AuthPage";
import { currentEmail, logoutUser } from "./session";
import type { TrafficLightSchedule } from "./trafficLight";

const trafficLight: TrafficLightSchedule = {
  redSeconds: 40,
  greenSeconds: 35,
  startsAtSeconds: 5 * 60 * 60,
};

function App() {
  const [email, setEmail] = useState<string | null>(() => currentEmail());

  if (email) {
    return (
      <MainPage
        email={email}
        onLogout={() => {
          logoutUser();
          setEmail(null);
        }}
        trafficLight={trafficLight}
      />
    );
  }

  return <AuthPage onSuccess={setEmail} />;
}

export default App;
