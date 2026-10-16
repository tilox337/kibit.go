import { useState } from "react";
import "./App.css";
import MainPage from "./pages/MainPage";
import AuthPage from "./pages/AuthPage";
import { currentEmail, logoutUser } from "./session";

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
      />
    );
  }

  return <AuthPage onSuccess={setEmail} />;
}

export default App;
