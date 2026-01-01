import { useContext } from "react";
import { AppContext } from "../../App.context";
import { Box } from "../Box";
import { ToggleButton } from "../ToggleButton/ToggleButton";

export const ControlPanel = () => {
  const { isAnimationEnabled, setIsAnimationEnabled, isDebugEnabled, setDebugEnabled } = useContext(AppContext);

  return (
    <Box style={{ height: '500px', width: '300px' }}>
      <ToggleButton onLabel="playing" offLabel="paused" onClick={() => setIsAnimationEnabled(!isAnimationEnabled)} checked={isAnimationEnabled} />
      &nbsp;
      <ToggleButton onLabel="debug" offLabel="debug" onClick={() => setDebugEnabled(!isDebugEnabled)} checked={isDebugEnabled} />
    </Box>
  );
};