import { useContext } from "react";
import { AppContext } from "../../App.context";
import { Box } from "../Box";

export const ControlPanel = () => {
  const { isAnimationEnabled, setIsAnimationEnabled, isDebugEnabled, setDebugEnabled } = useContext(AppContext);

  return (
    <Box style={{ height: '500px' }}>
      <button onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}>
        animation: {isAnimationEnabled ? "on" : "off"}
      </button>
      &nbsp;
      <button onClick={() => setDebugEnabled(!isDebugEnabled)}>
        debug: {isDebugEnabled ? "on" : "off"}
      </button>
      <br />
    </Box>
  );
};