import { useCallback, useContext, useMemo } from 'react';
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

  const generateInputHandler = useCallback(
    (key: 'x' | 'y' | 'r' | 'theta') => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedEye) {
          switch (key) {
            case 'x':
              selectedEye.center.x = Number(e.target.value);
              break;
            case 'y':
              selectedEye.center.y = Number(e.target.value);
              break;
            default:
              selectedEye[key] = Number(e.target.value);
          }
          onEyeChange(selectedEye);
        }
      };
    },
    [selectedEye, onEyeChange]
  );

  const areInputsDisabled = useMemo(() => {
    return !selectedEye;
  }, [selectedEye]);

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
              disabled={areInputsDisabled}
              onChange={generateInputHandler('x')}
            />
          </div>

          <span>y:</span>
          <div>
            <input
              type="number"
              value={selectedEye?.center.y.toFixed(2)}
              disabled={areInputsDisabled}
              onChange={generateInputHandler('y')}
            />
          </div>

          <span>Cornea radius:</span>
          <div>
            <input
              type="number"
              value={selectedEye?.r.toFixed(2)}
              disabled={areInputsDisabled}
              onChange={generateInputHandler('r')}
            />
          </div>

          <span>Rotation:</span>
          <div>
            <input
              type="range"
              min={-Math.PI / 2}
              max={Math.PI / 2}
              step={0.01}
              value={selectedEye?.theta}
              disabled={areInputsDisabled}
              onChange={generateInputHandler('theta')}
            />
          </div>
        </Grid>
      )}
    </Box>
  );
};
