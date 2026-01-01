import { useCallback, useMemo, useState } from 'react';
import { EyesCanvas, ControlPanel } from '@/molecules';
import { getDefaultEyes } from './utils';
import { AppContext } from './App.context';
import { StyledApp } from './App.styles';
import { Eye } from '@/models';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';

function App() {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isDebugEnabled, setDebugEnabled] = useState(false);
  const [eyes, setEyes] = useState<Eye[]>(getDefaultEyes());
  const [selectedEye, setSelectedEye] = useState<Eye | null>(null);

  const resetEyes = useCallback(() => {
    setEyes(getDefaultEyes());
    setSelectedEye(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      isAnimationEnabled,
      setIsAnimationEnabled,
      isDebugEnabled,
      setDebugEnabled,
      selectedEye,
      selectEye: (eye: Eye | null) => {
        setSelectedEye(eye);
      },
    }),
    [isAnimationEnabled, isDebugEnabled, selectedEye]
  );

  return (
    <StyledApp>
      <AppContext.Provider value={contextValue}>
        <EyesCanvas eyes={eyes} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

        <ControlPanel onReset={resetEyes} />
      </AppContext.Provider>
    </StyledApp>
  );
}

export default App;
