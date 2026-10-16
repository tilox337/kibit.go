import "./App.css";
import Settings from "./Settings";
import mapImg from "./assets/map.jpg";
import Footer from "./Footer";
import Zoom from "./Zoom";

function App() {
  return (
    <div
      style={{
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
        <Zoom></Zoom>
      </div>
    </div>
  );
}

export default App;
