import { useState } from "react";
import "./App.css";
import { EyeBoard } from "./components/EyeBoard";

const CANVAS_WIDTH = 1000,
  CANVAS_HEIGHT = 500;

function App() {
  const [animation, setAnimation] = useState(true);

  return (
    <>
      <EyeBoard
        animated={animation}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />

      <h1>Camaleones</h1>
      <button onClick={() => setAnimation(!animation)}>
        animation is {animation ? "on" : "off"}
      </button>
    </>
  );
}

export default App;
