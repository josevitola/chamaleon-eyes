import { useContext } from 'react';
import { AppContext } from '@/App.context';
import { Box, Button, ToggleButton } from '@/atoms';

export const ControlPanel = ({ onReset }: { onReset: () => void }) => {
  const {
    isAnimationEnabled,
    setIsAnimationEnabled,
    isDebugEnabled,
    setDebugEnabled,
    selectedEye,
  } = useContext(AppContext);

  return (
    <Box style={{ height: '500px', width: '300px' }}>
      <ToggleButton
        onLabel="playing"
        offLabel="paused"
        onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}
        checked={isAnimationEnabled}
      />
      &nbsp;
      <ToggleButton
        onLabel="debug"
        offLabel="debug"
        onClick={() => setDebugEnabled(!isDebugEnabled)}
        checked={isDebugEnabled}
      />
      <br />
      <br />
      <Button label="reset" onClick={onReset} />
      <br />
      <br />
      <h3>Currently selected eye:</h3>
      <p>{selectedEye?.id}</p>
    </Box>
  );
};
