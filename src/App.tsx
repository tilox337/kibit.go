import "./App.css";
import { useState } from "react";
import Settings from "./Settings";
import mapImg from "./assets/map.jpg";
import Footer from "./Footer";
import Zoom from "./Zoom";

function App() {
  const [zoomSettings, setZoomSettings] = useState(1);

  const handleZoomIn = (e: React.MouseEvent) => {
    setZoomSettings((prev) => Math.min(prev + 0.1, 3));
  };
  const handleZoomOut = (e: React.MouseEvent) => {
    setZoomSettings((prev) => Math.min(prev - 0.1, 0.5));
  };
  const handleResetZoom = (e: React.MouseEvent) => {
    setZoomSettings(1);
  };
  return (
    <div
      style={{
        transform: `scale(${zoomSettings}z)`,

        background: `url( ${mapImg} )`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        width: "98vw",
        height: "98vh",
      }}
    >
      {/* <img
        src={mapImg}
        style={{ display: "block", maxWidth: "100%", height: "auto" }}
      ></img>{" "} */}
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <Settings></Settings>
      </div>
      <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
        <Footer></Footer>
      </div>
      <div
        style={{
          position: "absolute",
          right: "5px",
          top: "50%",
        }}
      >
        <Zoom
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleResetZoom={handleResetZoom}
        ></Zoom>
      </div>
    </div>
  );
}

export default App;
