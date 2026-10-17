import { useState } from "react";

interface Props {}

export default function Settings() {
  const [showSettings, setShowSettings] = useState(false);

  const handleVolumeClick = (e: React.MouseEvent, level: number) => {
    e.preventDefault();
    console.log(`Volume: ${level}`);
  };

  return (
    <div>
      <button onClick={() => setShowSettings(!showSettings)}>
        {showSettings ? "Close settings" : "Settings"}
      </button>
      {showSettings && (
        <form style={{ width: "100%", background: "white" }}>
          <h1>Settings</h1>
          Volume
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button type="button" onClick={(e) => handleVolumeClick(e, 0)}>
              🔇
            </button>
            <button type="button" onClick={(e) => handleVolumeClick(e, 1)}>
              🔈
            </button>
            <button type="button" onClick={(e) => handleVolumeClick(e, 2)}>
              🔉
            </button>
            <button type="button" onClick={(e) => handleVolumeClick(e, 3)}>
              🔊
            </button>
          </div>
          <br></br>
          <div style={{ display: "flex", flexDirection: "column" }}>
            Change theme
            <div style={{ display: "flex", flexDirection: "row" }}>
              Light
              <input
                type="radio"
                id="option1"
                name="myGroup"
                value="Light"
              ></input>
              Dark
              <input
                type="radio"
                id="option2"
                name="myGroup"
                value="Dark"
              ></input>
              System
              <input
                type="radio"
                id="option3"
                name="myGroup"
                value="System"
              ></input>
            </div>
            <div>
              Avoid toll roads
              <input type="checkbox"></input>
            </div>
            <div>
              Avoid bad and rough roads
              <input type="checkbox"></input>
            </div>
            <button>Cursor color</button>
            <button>All settings</button>
          </div>
        </form>
      )}
    </div>
  );
}
