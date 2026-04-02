import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { ControlPanel } from '@/molecules/ControlPanel/ControlPanel';
import { getDefaultEyes } from './utils';
import { AppContext } from './App.context';
import { StyledApp } from './App.styles';
import { Eye } from '@/models';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import { Colors } from '@/styles';

const EyesCanvas = lazy(() => import('@/molecules/EyesCanvas/EyesCanvas'));

function App() {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [eyesById, setEyesById] = useState<Map<string, Eye>>(
    new Map(getDefaultEyes().map((eye) => [eye.id, eye])),
  );
  const [selectedEye, setSelectedEye] = useState<Eye | null>(null);

  const resetEyes = useCallback(() => {
    setEyesById(new Map(getDefaultEyes().map((eye) => [eye.id, eye])));
    setSelectedEye(null);
  }, []);

  const handleEyeChange = useCallback((updatedEye: Eye) => {
    setEyesById((prev) => {
      const newEyesById = new Map(prev);
      newEyesById.set(updatedEye.id, updatedEye);
      return newEyesById;
    });

    setSelectedEye((prev) => (prev?.id === updatedEye.id ? updatedEye : prev));
  }, []);

  const contextValue = useMemo(
    () => ({
      isAnimationEnabled,
      setIsAnimationEnabled,
      isEditing,
      setIsEditing,
      selectedEye,
      selectEye: (eye: Eye | null) => {
        setSelectedEye(eye);
      },
    }),
    [isAnimationEnabled, isEditing, selectedEye],
  );

  return (
    <StyledApp>
      <AppContext.Provider value={contextValue}>
        <Suspense
          fallback={
            <div
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                background: Colors.BACKGROUND,
              }}
            />
          }
        >
          <EyesCanvas
            eyesById={eyesById}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onEyeChange={handleEyeChange}
          />
        </Suspense>

        <ControlPanel onReset={resetEyes} onEyeChange={handleEyeChange} />
      </AppContext.Provider>
    </StyledApp>
  );
}

export default App;
