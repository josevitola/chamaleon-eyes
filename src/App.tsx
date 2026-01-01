import { useMemo, useState } from 'react';
import { ChamaleonEyes, ControlPanel } from '@/molecules';
import { initializeEyes } from './utils/initializeEyes';
import { AppContext } from './App.context';
import { StyledApp } from './App.styles';
import { Eye } from '@/models';

const CANVAS_WIDTH = 1000,
  CANVAS_HEIGHT = 500;

function App() {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isDebugEnabled, setDebugEnabled] = useState(false);
  const [eyes, setEyes] = useState<Eye[]>(
    initializeEyes({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      cols: 3,
      rows: 3,
      lineWidth: 2,
      radius: 30,
    })
  );

  const resetEyes = () => {
    setEyes(
      initializeEyes({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        cols: 3,
        rows: 3,
        lineWidth: 2,
        radius: 30,
      })
    );
  };

  const contextValue = useMemo(
    () => ({
      isAnimationEnabled,
      setIsAnimationEnabled,
      isDebugEnabled,
      setDebugEnabled,
    }),
    [isAnimationEnabled, isDebugEnabled]
  );

  return (
    <StyledApp>
      <AppContext.Provider value={contextValue}>
        <ChamaleonEyes
          eyes={eyes}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />

        <ControlPanel onReset={resetEyes} />
      </AppContext.Provider>
    </StyledApp>
  );
}

export default App;
