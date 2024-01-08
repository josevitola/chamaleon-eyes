import { useCallback, useState } from 'react';
import './App.css';
import { Canvas } from './components/Canvas';
import { initializeEyes } from './utils/initializeEyes';
import { Point } from './classes/Point';

const CANVAS_WIDTH = 600,
  CANVAS_HEIGHT = 300;
const eyes = initializeEyes(CANVAS_WIDTH, CANVAS_HEIGHT);

function App() {
  const [animation, setAnimation] = useState(true);
  const [mousePos, setMousePos] = useState<Point>();

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      ctx.fillStyle = '#242424';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      eyes.forEach((eye) => {
        if (frame > 50) {
          if (Math.random() < 0.003) {
            eye.startBlinking();
          }

          eye.updateBlink();
        }

        eye.draw(ctx, {
          point: mousePos,
          windowHeight: CANVAS_HEIGHT,
          windowWidth: CANVAS_WIDTH,
        });
      });

      if (mousePos) {
        mousePos.label(ctx);
      }
    },
    [mousePos]
  );

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

    setMousePos(p);
  }, []);

  const onMouseLeave = useCallback(() => {
    setMousePos(undefined);
  }, []);

  return (
    <>
      <div style={{ border: '1px solid darkgray' }}>
        <Canvas
          animated={animation}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          draw={draw}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        />
      </div>
      <h1>Camaleones</h1>
      <div className="card">
        <button onClick={() => setAnimation(!animation)}>
          animation is {animation ? 'on' : 'off'}
        </button>
      </div>
      <p className="subheader">Próxima página web</p>
    </>
  );
}

export default App;
