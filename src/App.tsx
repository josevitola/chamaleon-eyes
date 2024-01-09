import { useState } from "react";
import "./App.css";
import { ChamaleonEyes } from "./components/ChamaleonEyes";

const CANVAS_WIDTH = 600,
  CANVAS_HEIGHT = 300;

function App() {
  const [animation, setAnimation] = useState(true);

  return (
    <>
      <ChamaleonEyes width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

      <h1>Camaleones</h1>
      <div className="card">
        <button onClick={() => setAnimation(!animation)}>
          animation is {animation ? "on" : "off"}
        </button>
      </div>
      <p className="subheader">Próxima página web</p>
    </>
  );
}

export default App;
