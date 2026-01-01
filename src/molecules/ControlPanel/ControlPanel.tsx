import { useContext } from 'react';
import { AppContext } from '@/App.context';
import { Box, Button, Grid, ToggleButton } from '@/atoms';

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
      <Grid cols={3} rows={1}>
        <ToggleButton
          onLabel="playing"
          offLabel="paused"
          onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}
          checked={isAnimationEnabled}
        />
        <ToggleButton
          onLabel="debug"
          offLabel="debug"
          onClick={() => setDebugEnabled(!isDebugEnabled)}
          checked={isDebugEnabled}
        />
        <Button label="reset" onClick={onReset} />
      </Grid>
      <br />
      <h3>Currently selected eye:</h3>
      <p>{selectedEye?.id}</p>
    </Box>
  );
};
