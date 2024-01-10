import { useMemo, useState } from "react";
import "./App.css";
import { ChamaleonEyes } from "./components/ChamaleonEyes";
import { initializeEyes } from "./utils/initializeEyes";

const CANVAS_WIDTH = 600,
  CANVAS_HEIGHT = 300;

function App() {
  const [animation, setAnimation] = useState(true);

  const eyes = useMemo(
    () =>
      initializeEyes({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        cols: 5,
        lineWidth: 2,
        radius: 20,
        rows: 3,
      }),
    [CANVAS_WIDTH, CANVAS_HEIGHT]
  );

  return (
    <>
      <ChamaleonEyes
        animated={animation}
        eyes={eyes}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />

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
