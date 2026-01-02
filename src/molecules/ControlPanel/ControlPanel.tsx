import { useCallback, useContext } from 'react';
import { AppContext } from '@/App.context';
import { Box, Button, Grid, ToggleButton } from '@/atoms';
import { Eye } from '@/models';

export const ControlPanel = ({
  onReset,
  onEyeChange,
}: {
  onReset: () => void;
  onEyeChange: (eye: Eye) => void;
}) => {
  const {
    isAnimationEnabled,
    setIsAnimationEnabled,
    isEditing,
    setIsEditing,
    selectedEye,
  } = useContext(AppContext);

  const onXChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedEye) {
        selectedEye.center.x = Number(e.target.value);
        onEyeChange(selectedEye);
      }
    },
    [selectedEye]
  );

  const onYChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedEye) {
        selectedEye.center.y = Number(e.target.value);
        onEyeChange(selectedEye);
      }
    },
    [selectedEye]
  );

  const onRChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedEye) {
        selectedEye.r = Number(e.target.value);
        onEyeChange(selectedEye);
      }
    },
    [selectedEye]
  );
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
          onLabel="preview"
          offLabel="edit"
          onClick={() => setIsEditing(!isEditing)}
          checked={isEditing}
        />
        <Button label="reset" onClick={onReset} />
      </Grid>
      <br />
      <h3>{selectedEye?.id}</h3>

      {isEditing && (
        <Grid cols={2} rows={1}>
          <span>x:</span>
          <div>
            <input
              type="number"
              value={selectedEye?.center.x.toFixed(2)}
              onChange={onXChange}
            />
          </div>
          <span>y:</span>
          <div>
            <input
              type="number"
              value={selectedEye?.center.y.toFixed(2)}
              onChange={onYChange}
            />
          </div>
          <span>Cornea radius:</span>
          <div>
            <input
              type="number"
              value={selectedEye?.r.toFixed(2)}
              onChange={onRChange}
            />
          </div>
        </Grid>
      )}
    </Box>
  );
};
