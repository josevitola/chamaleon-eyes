import { useMemo, useState } from "react";
import "./App.css";
import { ChamaleonEyes } from "./components/ChamaleonEyes";
import { initializeEyes } from "./utils/initializeEyes";
import { AppContext } from "./App.context";

const CANVAS_WIDTH = 1000,
  CANVAS_HEIGHT = 500;

function App() {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isDebugEnabled, setDebugEnabled] = useState(false);

  const eyes = useMemo(
    () =>
      initializeEyes({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        cols: 3,
        rows: 3,
        lineWidth: 2,
        radius: 30,
      }),
    [CANVAS_WIDTH, CANVAS_HEIGHT]
  );

  const contextValue = useMemo(() => ({
    isAnimationEnabled,
    setIsAnimationEnabled,
    isDebugEnabled,
    setDebugEnabled,
  }), [isAnimationEnabled, isDebugEnabled]);

  return (
    <>
      <AppContext.Provider value={contextValue}>
        <ChamaleonEyes
          eyes={eyes}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />
      </AppContext.Provider>

      <h1>Camaleones</h1>
      <div className="card">
        <button onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}>
          animation is {isAnimationEnabled ? "on" : "off"}
        </button>
        &nbsp;
        <button onClick={() => setDebugEnabled(!isDebugEnabled)}>
          debug is {isDebugEnabled ? "on" : "off"}
        </button>
      </div>
      <p className="subheader">Próxima página web</p>
    </>
  );
}

export default App;
